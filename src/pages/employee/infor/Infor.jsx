import React from "react";
import { useSelector } from "react-redux";
import { Descriptions, Card } from "antd";

const Infor = () => {
  // Lấy thông tin nhân viên từ Redux Store
  const employee = useSelector((state) => state.auth.user?.employeeId);

  if (!employee) {
    return <p>Không có thông tin nhân viên để hiển thị.</p>;
  }

  return (
    <div className="p-6">
      <Card title={`Xin chào ${employee.name}!`} className="shadow-md">
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
      </Card>
    </div>
  );
};

export default Infor;
