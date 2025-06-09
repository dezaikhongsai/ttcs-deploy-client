import React, { useEffect, useState } from 'react';
import { Modal, Form, InputNumber, DatePicker, TimePicker, Button, Select, message } from 'antd';
import dayjs from 'dayjs';
import { getWorkSchedule } from '../services/payroll.service';

const ModalTimeSheetForm = ({ visible, onCancel, onSubmit, mode = 'add', initialValues = null, employeeId }) => {
  const [form] = Form.useForm();
  const isEdit = mode === 'edit';
  const [workScheduleOptions, setWorkScheduleOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timeSheetId, setTimeSheetId] = useState(null);

  // Fetch work schedules
  const fetchWorkSchedules = async () => {
    try {
      setLoading(true);
      const data = await getWorkSchedule();
      console.log('API Response:', data); // Debug log

      if (Array.isArray(data)) {
        const options = data.map(schedule => ({
          label: `${schedule.workSchedule} (${schedule.timeStart} - ${schedule.timeEnd})`,
          value: schedule._id,
          timeStart: schedule.timeStart,
          timeEnd: schedule.timeEnd
        }));
        console.log('Formatted Options:', options); // Debug log
        setWorkScheduleOptions(options);
      }
    } catch (error) {
      console.error('Error fetching work schedules:', error);
      message.error('Không thể tải danh sách ca làm việc');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkSchedules();
  }, []);

  useEffect(() => {
    if (visible) {
      if (isEdit && initialValues) {
        console.log('Initial values for edit:', initialValues);
        // Format dates for edit mode
        const formattedValues = {
          date: dayjs(initialValues.day),
          workSchedule: initialValues.workScheduleId,
          checkIn: dayjs(initialValues.checkIn, 'HH:mm'),
          checkOut: dayjs(initialValues.checkOut, 'HH:mm'),
          bonus: initialValues.bonus || 0,
          fine: initialValues.fine || 0,
        };
        console.log('Formatted values for form:', formattedValues);
        form.setFieldsValue(formattedValues);
        // Store timesheet ID if in edit mode
        setTimeSheetId(initialValues._id);
      } else {
        // Reset form and timesheet ID for add mode
        form.resetFields();
        setTimeSheetId(null);
      }
    }
  }, [visible, initialValues, isEdit]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      console.log('Form values before formatting:', values);
      
      // Format values before submitting
      const formattedValues = {
        employeeId: employeeId,
        day: values.date.format('YYYY-MM-DD'),
        workScheduleId: values.workSchedule,
        checkIn: values.checkIn.format('HH:mm'),
        checkOut: values.checkOut.format('HH:mm'),
        status: 'Hoàn thành',
        bonus: values.bonus || 0,
        fine: values.fine || 0,
        _id: timeSheetId,
      };

      // Add _id if in edit mode
      if (isEdit && timeSheetId) {
        formattedValues._id = timeSheetId;
      }

      console.log('Formatted values for submit:', formattedValues);
      console.log('Mode:', mode);
      onSubmit(formattedValues);
      form.resetFields();
      setTimeSheetId(null); // Reset timesheet ID after submit
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleCancel = () => {
    console.log('Form cancelled - Current values:', form.getFieldsValue()); // Debug log
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={isEdit ? 'Chỉnh sửa chấm công' : 'Thêm chấm công'}
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Hủy
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          {isEdit ? 'Cập nhật' : 'Thêm mới'}
        </Button>,
      ]}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item
          name="date"
          label="Ngày chấm công"
          rules={[
            { required: true, message: 'Vui lòng chọn ngày!' },
            {
              validator: (_, value) => {
                if (value && value.isAfter(dayjs())) {
                  return Promise.reject('Không thể chọn ngày trong tương lai!');
                }
                return Promise.resolve();
              }
            }
          ]}
        >
          <DatePicker
            style={{ width: '100%' }}
            format="DD/MM/YYYY"
            placeholder="Chọn ngày"
            disabledDate={current => current && current.isAfter(dayjs())}
          />
        </Form.Item>

        <Form.Item
          name="workSchedule"
          label="Ca làm việc"
          rules={[{ required: true, message: 'Vui lòng chọn ca làm việc!' }]}
        >
          <Select
            options={workScheduleOptions || []}
            placeholder="Chọn ca làm việc"
            loading={loading}
            allowClear
          />
        </Form.Item>

        <Form.Item
          name="checkIn"
          label="Giờ vào"
          rules={[{ required: true, message: 'Vui lòng chọn giờ vào!' }]}
        >
          <TimePicker
            style={{ width: '100%' }}
            format="HH:mm"
            placeholder="Chọn giờ vào"
          />
        </Form.Item>

        <Form.Item
          name="checkOut"
          label="Giờ ra"
          rules={[
            { required: true, message: 'Vui lòng chọn giờ ra!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || !getFieldValue('checkIn')) {
                  return Promise.resolve();
                }
                if (value.isBefore(getFieldValue('checkIn'))) {
                  return Promise.reject('Giờ ra phải sau giờ vào!');
                }
                return Promise.resolve();
              },
            }),
          ]}
        >
          <TimePicker
            style={{ width: '100%' }}
            format="HH:mm"
            placeholder="Chọn giờ ra"
          />
        </Form.Item>

        <Form.Item
          name="bonus"
          label="Thưởng"
          initialValue={0}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            step={1000}
            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => value.replace(/\$\s?|(,*)/g, '')}
            placeholder="Nhập số tiền thưởng"
            addonAfter="VNĐ"
          />
        </Form.Item>

        <Form.Item
          name="fine"
          label="Phạt"
          initialValue={0}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            step={1000}
            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => value.replace(/\$\s?|(,*)/g, '')}
            placeholder="Nhập số tiền phạt"
            addonAfter="VNĐ"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalTimeSheetForm;
