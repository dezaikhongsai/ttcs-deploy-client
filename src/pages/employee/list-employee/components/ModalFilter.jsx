import { Modal, Form, Select } from "antd";

const { Option } = Select;

const ModalFilter = ({ visible, onCancel, onApply }) => {
  const handleOk = () => {
    document.getElementById("filter-form").dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
  };

  return (
    <Modal
      title="Lọc nhân viên"
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      okText="Lọc" 
      cancelText="Hủy" 
    >
      <Form id="filter-form" onFinish={onApply} layout="vertical">
        <Form.Item label="Giới tính" name="gender">
          <Select placeholder="Chọn giới tính" allowClear>
            <Option value="Nam">Nam</Option>
            <Option value="Nữ">Nữ</Option>
          </Select>
        </Form.Item>
        <Form.Item label="Chức vụ" name="position">
          <Select placeholder="Chọn chức vụ" allowClear>
            <Option value="Admin">Admin</Option>
            <Option value="Quản lý">Quản lý</Option>
            <Option value="Thu ngân">Thu ngân</Option>
            <Option value="Pha chế">Pha chế</Option>
            <Option value="Phục vụ">Phục vụ</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalFilter;