import React from "react";
import { Modal, Descriptions } from "antd";

const ModalEmployee = ({ visible, onClose, employee }) => {
  return (
    <Modal
      title= {`Thông tin nhân viên ${employee ? employee.name : ""}`}
      open={visible}
      onCancel={onClose}
      footer={null} 
    >
      {employee ? (
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Họ và tên">
            {employee.name}
          </Descriptions.Item>
          <Descriptions.Item label="Giới tính">
            {employee.gender}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày sinh">
            {new Date(employee.dob).toLocaleDateString("vi-VN")}
          </Descriptions.Item>
          <Descriptions.Item label="Chức vụ">
            {employee.position}
          </Descriptions.Item>
          <Descriptions.Item label="Email liên hệ">
            {employee.emailContact}
          </Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">
            {employee.phoneContact}
          </Descriptions.Item>
          <Descriptions.Item label="Lương theo giờ">
            {employee.salaryPerHour.toLocaleString("vi-VN")} VND
          </Descriptions.Item>
        </Descriptions>
      ) : (
        <p>Đang tải thông tin...</p>
      )}
    </Modal>
  );
};

export default ModalEmployee;
