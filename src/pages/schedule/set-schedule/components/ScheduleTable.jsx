import { Button, Tag, Table, Space, Modal } from 'antd';
import dayjs from 'dayjs';

const ScheduleTable = ({ assignments = [], handleApproveSchedule, handleCancelSchedule, loading }) => {
  const columns = [
    {
      title: 'STT',
      key: 'stt',
      render: (_, __, index) => index + 1,
      width: 80,
      align: 'center'
    },
    {
      title: 'Ngày làm việc',
      dataIndex: 'day',
      key: 'day',
      render: (text) => dayjs(text).format('DD/MM/YYYY'),
      width: 150,
      align: 'center'
    },
    {
      title: 'Ca làm việc',
      dataIndex: 'workSchedule',
      key: 'workSchedule',
      render: (item) => {
        if (!item) return 'Không có dữ liệu';
        return `${item.workSchedule} ${item.timeStart} - ${item.timeEnd}`;
      },
      width: 200,
      align: 'center'
    },
    {
      title: 'Nhân viên',
      dataIndex: 'employee',
      key: 'employee',
      render: (employee) => {
        if (!employee) return 'Không có dữ liệu';
        return employee.name || 'Không có tên';
      },
      width: 200,
      align: 'center'
    },
    {
      title: "Chức vụ",
      dataIndex: "position",
      key: "position",
      render: (position) => {
        let color;
        switch (position) {
          case "Admin":
            color = "red";
            break;
          case "Quản lý":
            color = "blue";
            break;
          case "Thu ngân":
            color = "green";
            break;
          case "Pha chế":
            color = "orange";
            break;
          case "Phục vụ":
            color = "purple";
            break;
          default:
            color = "gray";
        }
        return <Tag color={color}>{position}</Tag>;
      },
      width: 200,
      align: 'center'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 200,
      align: 'center',
      render: (text) => {
        let color = '';
        switch (text) {
          case 'Chờ duyệt':
            color = 'orange';
            break;
          case 'Đã duyệt':
            color = 'green';
            break;
          case 'Đã hủy':
            color = 'red';
            break;
          default:
            color = 'blue';
        }
        return <Tag color={color}>{text}</Tag>;
      },
      
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          {record.status === 'Chờ duyệt' && (
            <Button 
              type="primary"
              onClick={() => handleApproveSchedule(record)}
            >
              Duyệt
            </Button>
          )}
          <Button 
            danger 
            onClick={() => {
              Modal.confirm({
                title: 'Xác nhận hủy',
                content: `Bạn có chắc chắn muốn hủy lịch làm việc của ${record.employee.name} vào ngày ${dayjs(record.day).format('DD/MM/YYYY')}?`,
                okText: 'Xác nhận',
                cancelText: 'Hủy',
                onOk: () => handleCancelSchedule(record)
              });
            }}
          >
            Hủy
          </Button>
        </Space>
      ),
      width: 200,
      align: 'center'
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={assignments}
      rowKey="_id"
      pagination={false}
      scroll={{ x: 'max-content' }}
      loading={loading}
    />
  );
};

export default ScheduleTable;