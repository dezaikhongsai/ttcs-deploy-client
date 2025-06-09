import React, { useState } from 'react';
import { Calendar, Modal, Form, Select, message, Badge } from 'antd';
import dayjs from 'dayjs';

const ALLOWED_POSITIONS = {
  'Pha chế': ['Pha chế', 'Phục vụ', 'Thu ngân'],
  'Quản lý': ['Pha chế', 'Phục vụ', 'Thu ngân'],
  'Admin': ['Pha chế', 'Phục vụ', 'Thu ngân'],
  'Phục vụ': ['Phục vụ'],
  'Thu ngân': ['Thu ngân']
};

const CalendarView = ({
  isModalVisible,
  setIsModalVisible,
  selectedDate,
  setSelectedDate,
  form,
  workSchedule,
  handleOk,
  handleCancel,
  dateCellRender,
  currentEmployee,
  onMonthChange,
}) => {
  const [isMonthChanging, setIsMonthChanging] = useState(false);

  const handleDateSelect = (value) => {
    if (!isMonthChanging) {
      setSelectedDate(value);
      setIsModalVisible(true);
    }
  };

  const handlePanelChange = (date, mode) => {
    if (mode === 'month' && onMonthChange) {
      setIsMonthChanging(true);
      onMonthChange(date);
      if (isModalVisible) {
        setIsModalVisible(false);
      }
      // Reset the flag after a short delay
      setTimeout(() => {
        setIsMonthChanging(false);
      }, 100);
    }
  };

  const getAvailablePositions = () => {
    if (!currentEmployee) return [];
    return ALLOWED_POSITIONS[currentEmployee.position] || [];
  };

  return (
    <>
      <Calendar
        onSelect={handleDateSelect}
        onPanelChange={handlePanelChange}
        disabledDate={(current) => current && current < dayjs().startOf('day')}
        cellRender={dateCellRender}
      />
      <Modal
        title={`Đăng ký ca làm việc cho ngày ${selectedDate?.format('DD/MM/YYYY')}`}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Đăng ký"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="workSchedule"
            label="Chọn ca"
            rules={[{ required: true, message: 'Vui lòng chọn ca!' }]}
          >
            <Select placeholder="Chọn ca làm việc">
              {Array.isArray(workSchedule) &&
                workSchedule.map((item) => (
                  <Select.Option key={item._id} value={item._id}>
                    {`${item.workSchedule} (${item.timeStart} - ${item.timeEnd})`}
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="position"
            label="Chọn vị trí"
            rules={[{ required: true, message: 'Vui lòng chọn vị trí!' }]}
          >
            <Select placeholder="Chọn vị trí làm việc">
              <Select.Option value="Pha chế">Pha chế</Select.Option>
              <Select.Option value="Phục vụ">Phục vụ</Select.Option>
              <Select.Option value="Thu ngân">Thu ngân</Select.Option>
            </Select> 
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default CalendarView;