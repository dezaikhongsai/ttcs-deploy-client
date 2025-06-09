import React, { useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  message,
} from "antd";
import moment from "moment"; // Import moment

const { Option } = Select;

const ModalEmployeeForm = ({
  visible,
  onClose,
  onSubmit,
  mode,
  employeeData,
}) => {
  const [form] = Form.useForm();

  // Khi visible hoặc mode thay đổi → reset form
  useEffect(() => {
    if (visible && mode === 1) {
      form.resetFields();
    }
  }, [visible, mode]);

  // Khi có employeeData → set lại dữ liệu form
  useEffect(() => {
    if (visible && mode === 2 && employeeData) {
      form.setFieldsValue({
        ...employeeData,
        dob: employeeData.dob ? moment(employeeData.dob) : null,
      });
    }
    console.log("data :" , employeeData)
  }, [employeeData, visible, mode, form]);


  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
      form.resetFields();
    } catch (error) {
      message.error("Vui lòng kiểm tra lại các trường nhập liệu!");
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={mode === 1 ? "Thêm nhân viên mới" : `Cập nhật thông tin nhân viên: ${employeeData?.name}`}
      open={visible}
      onCancel={handleCancel}
      onOk={handleOk}
      okText={mode === 1 ? "Thêm" : "Lưu"}
      cancelText="Hủy"
      destroyOnClose
      forceRender 
    >
      <Form 
        form={form} 
        layout="vertical"
        preserve={false}
      >
        <Form.Item
          label="Họ và tên"
          name="name"
          rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
        >
          <Input placeholder="Nhập họ và tên" />
        </Form.Item>
        <Form.Item
          label="Giới tính"
          name="gender"
          rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
        >
          <Select placeholder="Chọn giới tính">
            <Option value="Nam">Nam</Option>
            <Option value="Nữ">Nữ</Option>
          </Select>
        </Form.Item>
        <Form.Item
          label="Ngày sinh"
          name="dob"
          rules={[{ required: true, message: "Vui lòng chọn ngày sinh!" }]}
        >
          <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
        </Form.Item>
        <Form.Item
          label="Chức vụ"
          name="position"
          rules={[{ required: true, message: "Vui lòng chọn chức vụ!" }]}
        >
          <Select placeholder="Chọn chức vụ">
            <Option value="Admin">Admin</Option>
            <Option value="Quản lý">Quản lý</Option>
            <Option value="Thu ngân">Thu ngân</Option>
            <Option value="Pha chế">Pha chế</Option>
            <Option value="Phục vụ">Phục vụ</Option>
          </Select>
        </Form.Item>
        <Form.Item
          label="Email liên hệ"
          name="emailContact"
          rules={[
            { required: true, message: "Vui lòng nhập email liên hệ!" },
            { type: "email", message: "Email không hợp lệ!" },
          ]}
        >
          <Input placeholder="Nhập email liên hệ" />
        </Form.Item>
        <Form.Item
          label="Số điện thoại"
          name="phoneContact"
          rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}
        >
          <Input placeholder="Nhập số điện thoại" />
        </Form.Item>
        <Form.Item
          label="Lương theo giờ (VND)"
          name="salaryPerHour"
          rules={[{ required: true, message: "Vui lòng nhập lương theo giờ!" }]}
        >
          <InputNumber
            placeholder="Nhập lương theo giờ"
            style={{ width: "100%" }}
            min={0}
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalEmployeeForm;
