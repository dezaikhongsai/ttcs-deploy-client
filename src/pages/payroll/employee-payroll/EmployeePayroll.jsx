import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Card, DatePicker, Table, Empty, Descriptions, Spin } from 'antd';
import { getSalaryByEmployeeId, getTimeSheetByEmployeeId } from '../list-payroll/services/payroll.service';
import dayjs from 'dayjs';

const EmployeePayroll = () => {
  const employee = useSelector((state) => state.auth.user?.employeeId);
  const [selectedTerm, setSelectedTerm] = useState(dayjs());
  const [loading, setLoading] = useState(false);
  const [salaryData, setSalaryData] = useState(null);
  const [timeSheetData, setTimeSheetData] = useState([]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value) + ' VND';
  };

  const formatDate = (date) => {
    return dayjs(date).format('DD/MM/YYYY');
  };

  const fetchData = async () => {
    if (!employee || !selectedTerm) return;

    try {
      setLoading(true);
      const month = selectedTerm.format('MM');
      const year = selectedTerm.format('YYYY');

      // Fetch both salary and timesheet data
      const [salaryResponse, timesheetResponse] = await Promise.all([
        getSalaryByEmployeeId(employee._id, month, year),
        getTimeSheetByEmployeeId(employee._id, month, year)
      ]);

      if (salaryResponse.success) {
        setSalaryData(salaryResponse.data);
      }

      if (timesheetResponse.success) {
        setTimeSheetData(timesheetResponse.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedTerm, employee]);

  const handleTermChange = (date) => {
    setSelectedTerm(date);
  };

  const columns = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      width: 70,
      align: 'center',
      render: (_, __, index) => index + 1
    },
    {
      title: 'Ngày',
      dataIndex: 'day',
      key: 'day',
      width: 120,
      align: 'center',
      render: (day) => formatDate(day)
    },
    {
      title: 'Giờ vào',
      dataIndex: 'checkIn',
      key: 'checkIn',
      width: 100,
      align: 'center'
    },
    {
      title: 'Giờ ra',
      dataIndex: 'checkOut',
      key: 'checkOut',
      width: 100,
      align: 'center'
    },
    {
      title: 'Thưởng',
      dataIndex: 'bonus',
      key: 'bonus',
      width: 150,
      align: 'right',
      render: (value) => formatCurrency(value || 0)
    },
    {
      title: 'Phạt',
      dataIndex: 'fine',
      key: 'fine',
      width: 150,
      align: 'right',
      render: (value) => formatCurrency(value || 0)
    }
  ];

  return (
    <Spin spinning={loading}>
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ marginRight: 8 }}>Kỳ lương:</span>
            <DatePicker
              picker="month"
              value={selectedTerm}
              onChange={handleTermChange}
              format="MM/YYYY"
              allowClear={false}
              style={{ width: 200 }}
              placeholder="Chọn kỳ lương"
            />
          </div>
        </div>

        {salaryData && (
          <Card style={{ marginBottom: 16 }}>
            <Descriptions title="Thông tin lương" bordered column={2}>
              <Descriptions.Item label="Kỳ lương">{selectedTerm.format('MM/YYYY')}</Descriptions.Item>
              <Descriptions.Item label="Tên nhân viên">{employee?.name}</Descriptions.Item>
              <Descriptions.Item label="Lương/giờ">{formatCurrency(salaryData.salaryPerHour)}</Descriptions.Item>
              <Descriptions.Item label="Tổng giờ">{salaryData.totalTimeSheet} giờ</Descriptions.Item>
              <Descriptions.Item label="Lương cơ bản">{formatCurrency(salaryData.baseSalary)}</Descriptions.Item>
              <Descriptions.Item label="Thưởng">{formatCurrency(salaryData.bonus)}</Descriptions.Item>
              <Descriptions.Item label="Phạt">{formatCurrency(salaryData.fine)}</Descriptions.Item>
              <Descriptions.Item label="Tổng lương">
                <span style={{ color: '#1890ff', fontWeight: 'bold', fontSize: '16px' }}>
                  {formatCurrency(salaryData.totalSalary)}
                </span>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}

        <div style={{ marginBottom: 16 }}>
          <h3>Chi tiết chấm công</h3>
        </div>

        <Table
          columns={columns}
          dataSource={timeSheetData}
          rowKey="_id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng số: ${total} bản ghi`,
          }}
          scroll={{ x: 1000 }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span>
                    Không có dữ liệu chấm công trong tháng này
                  </span>
                }
              />
            )
          }}
        />
      </Card>
    </Spin>
  );
};

export default EmployeePayroll;