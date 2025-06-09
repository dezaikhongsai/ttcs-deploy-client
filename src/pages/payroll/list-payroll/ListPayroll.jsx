import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Typography, Pagination, Row, DatePicker } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, UnorderedListOutlined, BarChartOutlined } from '@ant-design/icons';
import {getSalaryAllEmployee} from './services/payroll.service';
import dayjs from 'dayjs';
import ModalDetail from './components/ModalDetail';
import PayrollTable from './components/PayrollTable';
const { Title } = Typography;

const ListPayroll = () => {
  // Thêm state cho pageSize
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewMode, setViewMode] = useState('list');
  const [salary , setSalary] = useState(null);
  const [selectedDate, setSelectedDate] = useState(dayjs()); // Mặc định là tháng hiện tại
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const handlePaginationChange = (page, pageSizeNew) => {
    setCurrent(page);
    setPageSize(pageSizeNew);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const fecthData  = async () => {
    if (!selectedDate) return;
    
    try {
      setLoading(true);
      const month = String(selectedDate.month() + 1).padStart(2, '0');
      const year = selectedDate.year();
      
      const res = await getSalaryAllEmployee(month, year.toString());
      // Thêm key cho mỗi item trong mảng data
      const dataWithKeys = res.data.map((item, index) => ({
        ...item,
        key: item.employeeId // Sử dụng employeeId làm key
      }));
      setSalary(dataWithKeys);
    } catch (error) {
      console.error("Error fetching salary data:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(()=> {
    fecthData();
  } , [selectedDate])

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value) + ' VND';
  };
  
  const handleView = (record) => {
    setSelectedRecord(record);
    setModalVisible(true);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setSelectedRecord(null);
  };

  const columns = [
    {
      title: 'STT',
      dataIndex: 'key',
      align: 'center',
      render: (text, record, index) => index + 1,
      width: 50,
    },
    {
      title: 'Tên nv',
      dataIndex: 'employeeName',
      align: 'center',
      width: 150,
    },
    {
      title: 'Số giờ',
      dataIndex: 'totalTimeSheet',
      align: 'center',
      width: 70,
    },
    {
      title: 'Lương/giờ',
      dataIndex: 'salaryPerHour',
      align: 'center',
      width: 90,
      render: (value) => formatCurrency(value),
    },
    {
      title: 'Lương cơ bản',
      dataIndex: 'baseSalary',
      align: 'center',
      width: 110,
      render: (value) => formatCurrency(value),
    },
    {
      title: 'Thưởng',
      dataIndex: 'bonus',
      align: 'center',
      width: 80,
      render: (value) => value !== 0 ? <Tag color="green">{formatCurrency(value)}</Tag> : formatCurrency(0),
    },
    {
      title: 'Phạt',
      dataIndex: 'fine',
      align: 'center',
      width: 80,
      render: (value) => value !== 0 ? <Tag color="red">{formatCurrency(value)}</Tag> : formatCurrency(0),
    },
    {
      title: 'Tổng lương',
      dataIndex: 'totalSalary',
      align: 'center',
      width: 110,
      render: (value) => <p>{formatCurrency(value)}</p>
    },
    {
      title: 'Chức năng',
      key: 'action',
      align: 'center',
      width: 100 ,
      render: (_, record) => (
        <Space>
          <Button type="primary" size="small" icon={<EyeOutlined />} onClick={() => handleView(record)}>Xem chi tiết</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ width: "100%", maxWidth: 1400, marginBottom: 24 }}>
        <Row gutter={8} align="middle" justify="space-between">
          <Space>
            <Button
              type={viewMode === 'list' ? 'primary' : 'default'}
              icon={<UnorderedListOutlined />}
              onClick={() => setViewMode('list')}
            >
              Danh sách
            </Button>
            <Button
              type={viewMode === 'statistics' ? 'primary' : 'default'}
              icon={<BarChartOutlined />}
              onClick={() => setViewMode('statistics')}
            >
              Thống kê
            </Button>
          </Space>
        
        </Row>
      </div>

      {viewMode === 'statistics' ? (
       <>
        <PayrollTable />
       </>
      ) : (
        <>
          <div >
            <div >
            <DatePicker
            picker="month"
            value={selectedDate}
            onChange={handleDateChange}
            format="MM/YYYY"
            style={{ width: 200 }}
            placeholder="Chọn kỳ lương"
          />
              <Table
                columns={columns}
                dataSource={salary}
                pagination={{
                  total: salary?.length || 0,
                  pageSize: pageSize,
                  current: current,
                  onChange: handlePaginationChange,
                  showSizeChanger: true,
                  showTotal: (total, range) => `${range[0]}-${range[1]} trên ${total} bản ghi`,
                  pageSizeOptions: ['5', '10', '20', '50'],
                  locale: {
                    items_per_page: '/ trang',
                  },
                  position: ['bottomCenter']
                }}
                loading={loading}
                bordered
                tableLayout="fixed"
                style={{ fontSize: 14, minWidth: 900 }}
                className="payroll-table"
              />
            </div>
          </div>
        </>
      )}
      <ModalDetail
        visible={modalVisible}
        onCancel={handleModalCancel}
        record={selectedRecord}
        onDataChange={fecthData}
      />
    </div>
  );
};

export default ListPayroll;