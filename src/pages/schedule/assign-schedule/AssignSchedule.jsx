import React, { useEffect, useState } from 'react';
import { Button, message, Form } from 'antd';
import { getWorkSchedule , addAssignment , getAssignmentInRole } from './services/assignment.service';
import CalendarView from './components/CalendarView';
import ScheduleTable from './components/AssignmentTable';
import { useSelector } from 'react-redux';
import { CheckOutlined, CalendarOutlined } from '@ant-design/icons';
const ShiftRegistration = () => {
  const [schedules, setSchedules] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [form] = Form.useForm();
  const [isCalendarView, setIsCalendarView] = useState(true);
  const [workSchedule, setWorkSchedule] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [trigger, setTrigger] = useState(false);
  const [loading, setLoading] = useState(false);
  const employee = useSelector((state) => state.auth.user?.employeeId);

  useEffect(() => {
    if (isModalVisible) {
      const fetchWorkSchedule = async () => {
        try {
          const data = await getWorkSchedule();
          if (Array.isArray(data)) {
            setWorkSchedule(data);
          } else {
            console.error('API getWorkSchedule trả về dữ liệu không hợp lệ:', data);
            setWorkSchedule([]);
          }
        } catch (error) {
          console.error('Lỗi khi gọi API getWorkSchedule:', error);
        }
      };
      fetchWorkSchedule();
    }
  }, [isModalVisible]);

  useEffect(() => {
    if (!isCalendarView) {
      const fetchAssignment = async () => {
        setLoading(true);
        try {
          const res = await getAssignmentInRole(employee.position, employee._id);

          if (res && Array.isArray(res.data)) {
            setAssignments(res.data);
          } else {
            console.warn('Dữ liệu trả về không hợp lệ:', res);
            setAssignments([]);
          }
        } catch (error) {
          console.error('Lỗi khi fetch assignment:', error);
          setAssignments([]);
        } finally {
          setLoading(false);
        }
      };

      fetchAssignment();
    }
  }, [trigger, isCalendarView, employee.position, employee._id]);

  useEffect(() => {
    console.log('Cập nhật assignments:', assignments);
  }, [assignments]);

  const handleOk = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields(); 
      const assignmentData = {
        employee: {_id : employee._id}, 
        day: selectedDate.format('YYYY-MM-DD'),
        workSchedule: {_id : values.workSchedule},
        position: values.position,
      };

      await addAssignment(assignmentData);
      message.success('Đăng ký ca làm thành công!');
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error(error.message || 'Đăng ký ca làm thất bại!');
    } finally {
      setLoading(false);
      setTrigger(!trigger);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalVisible(false);
  };

  const dateCellRender = (value) => {
    const formattedDate = value.format('YYYY-MM-DD');
    const daySchedules = schedules.filter((schedule) => schedule.date === formattedDate);

    return (
      <ul className="events">
        {daySchedules.map((item) => (
          <li key={item.id}>
            <Badge
              status={item.status === 'approved' ? 'success' : item.status === 'pending' ? 'warning' : 'default'}
              text={`${item.shiftName} (${item.status === 'approved' ? 'Đã duyệt' : 'Chờ duyệt'})`}
            />
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <Button
            type={isCalendarView ? 'primary' : 'default'}
            onClick={() => setIsCalendarView(true)}
            style={{ marginRight: '10px' }}
            icon={<CheckOutlined />}
          >
            Đăng ký lịch
          </Button>
          <Button
            type={!isCalendarView ? 'primary' : 'default'}
            onClick={() => setIsCalendarView(false)}
            icon={<CalendarOutlined />}
          >
            Lịch đã đăng ký
          </Button>
        </div>
      </div>
      {isCalendarView ? (
        <CalendarView
          isModalVisible={isModalVisible}
          setIsModalVisible={setIsModalVisible}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          form={form}
          workSchedule={workSchedule}
          handleOk={handleOk}
          handleCancel={handleCancel}
          dateCellRender={dateCellRender}
        />
      ) : (
        <ScheduleTable schedules={assignments} onScheduleChange={() => setTrigger(!trigger)} trigger={trigger} loading={loading} />
      )}
    </div>
  );
};

export default ShiftRegistration;