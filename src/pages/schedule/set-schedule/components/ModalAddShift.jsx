import { Modal, Form, DatePicker, Select, Space, Button, Tag, Row, Col, Tooltip, message as antMessage } from 'antd';
import { ClockCircleOutlined, UserAddOutlined, DeleteOutlined, PlusOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { createShift, getWorkSchedule  , getEmployeeWithPosition} from '../services/schedule.service.js';
import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Đăng ký plugins
dayjs.extend(utc);
dayjs.extend(timezone);

const ROLE_OPTIONS = [
  { label: 'Phục vụ', value: 'Phục vụ' },
  { label: 'Pha chế', value: 'Pha chế' },
  { label: 'Thu ngân', value: 'Thu ngân' },
  // Thêm các vai trò khác nếu cần
];

const getValidRoles = (position) => {
  if (position === 'Phục vụ') return [ROLE_OPTIONS[0]];
  if (position === 'Thu ngân') return [ROLE_OPTIONS[2]];
  if (position === 'Pha chế' || position === 'Admin') return ROLE_OPTIONS;
  return [];
};

const ModalAddShift = ({ visible, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [workScheduleList, setWorkScheduleList] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [employees, setEmployees] = useState([{ employee: undefined, role: 'Phục vụ' }]);
  const [employeeList, setEmployeeList] = useState([]);
  const [employeeError, setEmployeeError] = useState('');

  useEffect(() => {
    const fetchWorkSchedules = async () => {
      if (visible) {
        try {
          setFetchLoading(true);
          const data = await getWorkSchedule();
          setWorkScheduleList(data || []);
          const employeeData = await getEmployeeWithPosition();
          setEmployeeList(employeeData || []);
        } catch (error) {
          console.error('Error fetching work schedules:', error);
        } finally {
          setFetchLoading(false);
        }
      }
    };
    fetchWorkSchedules();
  }, [visible]);

  // Reset employees list and error when modal opens
  useEffect(() => {
    if (visible) {
      setEmployees([{ employee: undefined, role: 'Phục vụ' }]);
      setEmployeeError('');
      form.resetFields();
    }
  }, [visible, form]);

  const handleAddEmployee = () => {
    setEmployees([...employees, { employee: undefined, role: 'Phục vụ' }]);
    setEmployeeError('');
  };

  const handleRemoveEmployee = (idx) => {
    setEmployees(employees.filter((_, i) => i !== idx));
    setEmployeeError('');
  };

  const handleEmployeeChange = (idx, field, value) => {
    const newList = employees.map((item, i) => {
      if (i === idx) {
        if (field === 'employee') {
          const emp = employeeList.find(e => e._id === value);
          const validRoles = getValidRoles(emp?.position);
          return { ...item, employee: value, role: validRoles[0]?.value || undefined };
        }
        return { ...item, [field]: value };
      }
      return item;
    });
    setEmployees(newList);
    setEmployeeError('');
  };

  // Validate duplicate employees
  const hasDuplicateEmployee = () => {
    const selected = employees.map(e => e.employee).filter(Boolean);
    return new Set(selected).size !== selected.length;
  };

  const handleSubmit = async (values) => {
    if (hasDuplicateEmployee()) {
      setEmployeeError('Không được chọn trùng nhân viên trong một ca làm!');
      return;
    }
    try {
      setLoading(true);
      const formattedData = {
        day: dayjs(values.date).format('YYYY-MM-DD'),
        workScheduleId: values.workSchedule,
        employees: employees
          .filter(e => e.employee)
          .map(e => ({ employeeId: e.employee, roleInShift: e.role })),
      };
      await createShift(formattedData);
      form.resetFields();
      antMessage.success('Phân ca thành công!');
      onSuccess?.();
    } catch (error) {
      // Lấy message từ backend nếu có
      const msg = error?.response?.data?.message || error.message || 'Có lỗi xảy ra!';
      antMessage.error(msg);
      console.error('Error creating shift:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Thêm ca làm việc mới"
      open={visible}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="date"
          label="Ngày làm việc"
          rules={[{ required: true, message: 'Vui lòng chọn ngày làm việc' }]}
        >
          <DatePicker 
            style={{ width: '100%' }} 
            format="DD/MM/YYYY"
            placeholder="Chọn ngày"
          />
        </Form.Item>

        <Form.Item
          name="workSchedule"
          label="Ca làm việc"
          rules={[{ required: true, message: 'Vui lòng chọn ca làm việc' }]}
        >
          <Select 
            placeholder="Chọn ca làm việc"
            loading={fetchLoading}
          >
            {workScheduleList.map(schedule => (
              <Select.Option key={schedule._id} value={schedule._id}>
                <Space>
                  <ClockCircleOutlined />
                  <span>{schedule.workSchedule}</span>
                  <Tag color="blue">{schedule.timeStart} - {schedule.timeEnd}</Tag>
                </Space>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <div style={{ marginBottom: 12, fontWeight: 500 }}>Nhân viên</div>
        {employeeError && <div style={{ color: 'red', marginBottom: 8 }}>{employeeError}</div>}
        <div>
          {employees.map((item, idx) => {
            const emp = employeeList.find(e => e._id === item.employee);
            const validRoles = getValidRoles(emp?.position);
            return (
              <Row gutter={8} key={idx} style={{ marginBottom: 8 }} align="middle">
                <Col flex="auto">
                  <Select
                    showSearch
                    placeholder="Chọn nhân viên"
                    value={item.employee}
                    style={{ width: '100%' }}
                    onChange={val => handleEmployeeChange(idx, 'employee', val)}
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {employeeList.map(emp => (
                      <Select.Option key={emp._id} value={emp._id} disabled={employees.some((e, i) => e.employee === emp._id && i !== idx)}>
                        <Tooltip title={<span>{emp.name} - {emp.position}</span>} placement="right">
                          <span>{emp.name} <InfoCircleOutlined style={{ color: '#1890ff', marginLeft: 4 }} /></span>
                        </Tooltip>
                      </Select.Option>
                    ))}
                  </Select>
                </Col>
                <Col flex="180px">
                  <Select
                    value={item.role}
                    style={{ width: '100%' }}
                    onChange={val => handleEmployeeChange(idx, 'role', val)}
                    disabled={!item.employee}
                  >
                    {validRoles.map(role => (
                      <Select.Option key={role.value} value={role.value}>{role.label}</Select.Option>
                    ))}
                  </Select>
                </Col>
                <Col>
                  <Button
                    icon={<DeleteOutlined />}
                    danger
                    type="text"
                    onClick={() => handleRemoveEmployee(idx)}
                    disabled={employees.length === 1}
                  />
                </Col>
              </Row>
            );
          })}
          <Button
            type="dashed"
            block
            icon={<PlusOutlined />}
            onClick={handleAddEmployee}
            style={{ marginTop: 8 }}
          >
            Thêm nhân viên
          </Button>
        </div>

        <Form.Item style={{ marginTop: 24 }}>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={onCancel}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Thêm ca làm
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalAddShift;