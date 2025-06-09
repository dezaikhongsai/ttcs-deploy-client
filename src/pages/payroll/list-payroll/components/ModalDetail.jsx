import React, { useEffect, useState } from 'react';
import { Modal, Table, Button, Space, Popconfirm, message, Empty, Card, Descriptions } from 'antd';
import { EditOutlined, DeleteOutlined, SaveOutlined, PlusOutlined, PrinterOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getTimeSheetByEmployeeId, getSalaryByEmployeeId  , updateTimeSheet , createTimeSheet , deleteTimeSheet , createPayroll} from '../services/payroll.service';
import ModalTimeSheetForm from './ModalTimeSheetForm';

const ModalDetail = ({ visible, onCancel, record, onDataChange }) => {
  const [loading, setLoading] = useState(false);
  const [timeSheetData, setTimeSheetData] = useState([]);
  const [salaryData, setSalaryData] = useState(null);
  const [timeSheetFormVisible, setTimeSheetFormVisible] = useState(false);
  const [timeSheetFormMode, setTimeSheetFormMode] = useState('add');
  const [selectedTimeSheet, setSelectedTimeSheet] = useState(null);

  // Reset data when modal closes
  useEffect(() => {
    if (!visible) {
      setTimeSheetData([]);
      setSalaryData(null);
    }
  }, [visible]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value) + ' VND';
  };

  const fecthData = async () => {
    if (!record) return;
    
    try {
      setLoading(true);
      setTimeSheetData([]); // Reset data before fetching
      // Tách term thành month và year
      const [month, year] = record.term.split('/');
      const res = await getTimeSheetByEmployeeId(record.employeeId, month, year);
      if (res.data && Array.isArray(res.data)) {
        setTimeSheetData(res.data);
      } else {
        setTimeSheetData([]);
      }
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Có lỗi khi tải dữ liệu chấm công';
        console.error("Error:", error);
        message.error(errorMessage);
        setTimeSheetData([]); // Reset data when error occurs
    } finally {
      setLoading(false);
    }
  }

  const fecthSalaryData = async () => {
    if (!record) return;
    try {
      const [month, year] = record.term.split('/');
      const res = await getSalaryByEmployeeId(record.employeeId, month, year);
      if (res.data) {
        setSalaryData(res.data);
      }
    } catch (error) {
       const msg = error?.response?.data?.message || error?.message || 'Có lỗi khi tải dữ liệu chấm công';
      console.error("Error fetching timesheet data:", msg);
      message.error(msg);
      setSalaryData(null);
    }
  }

  useEffect(() => {
    if (visible && record) {
      fecthData();
      fecthSalaryData();
    }
  }, [visible, record]);

  const formatDate = (date) => {
    return dayjs(date).format('DD/MM/YYYY');
  };

  const handleAddTimesheet = () => {
    setTimeSheetFormMode('add');
    setSelectedTimeSheet(null);
    setTimeSheetFormVisible(true);
  };

  const handleEditTimesheet = (timesheet) => {
    console.log('Raw timesheet data:', timesheet); 

    if (!timesheet) {
      message.error('Không có dữ liệu chấm công');
      return;
    }

    setTimeSheetFormMode('edit');
    
    const formattedTimesheet = {
      day: timesheet.date,
      workScheduleId: timesheet.workScheduleId, // Just use the ID directly
      checkIn: timesheet.checkIn,
      checkOut: timesheet.checkOut,
      bonus: timesheet.bonus || 0,
      fine: timesheet.fine || 0,
      _id: timesheet._id,
    };

    console.log('Formatted timesheet data:', formattedTimesheet); // Debug log
    setSelectedTimeSheet(formattedTimesheet);
    setTimeSheetFormVisible(true);
  };

  const handleTimeSheetFormCancel = () => {
    setTimeSheetFormVisible(false);
    setSelectedTimeSheet(null);
  };

  const handleTimeSheetFormSubmit = async (values) => {
    try {
      if (timeSheetFormMode === 'add') {
        // Create new timesheet
        const createData = {
          ...values,
          bonus: values.bonus || 0,
          fine: values.fine || 0,
          status: 'Hoàn thành'
        };
        const res = await createTimeSheet(createData);
        if (res.success) {
          message.success('Thêm chấm công thành công!');
        } else {
            const msg = error?.response?.data?.message || error?.message || 'Có lỗi khi tải dữ liệu chấm công';
            console.error("Error fetching timesheet data:", msg);
            message.error(msg);
        }
      } else {
        // Update existing timesheet
        const { _id, ...updateData } = values;
        updateData.bonus = updateData.bonus || 0;
        updateData.fine = updateData.fine || 0;
        updateData.status = 'Hoàn thành';
        
        const res = await updateTimeSheet(_id, updateData);
        if (res.success) {
          message.success('Cập nhật chấm công thành công!');
        } else {
            const msg = error?.response?.data?.message || error?.message || 'Có lỗi khi tải dữ liệu chấm công';
            console.error("Error fetching timesheet data:", msg);
            message.error(msg);
        }
      }
      
      setTimeSheetFormVisible(false);
      setSelectedTimeSheet(null);

      // Refresh all data
      setLoading(true);
      try {
        await Promise.all([
          fecthData(),
          fecthSalaryData()
        ]);
        // Trigger parent component data refresh
        if (onDataChange) {
          onDataChange();
        }
      } catch (error) {
        const msg = error?.response?.data?.message || error?.message || 'Có lỗi khi tải dữ liệu chấm công';
        console.error("Error fetching timesheet data:", msg);
        message.error(msg);
      } finally {
        setLoading(false);
      }
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || 'Có lỗi khi tải dữ liệu chấm công';
      console.error("Error fetching timesheet data:", msg);
      message.error(msg);
    }
  };

  // Handle delete timesheet
  const handleDelete = async (record) => {
    try {
      setLoading(true);
      const res = await deleteTimeSheet(record._id);
      
      if (res.message && res.data) {
        message.success(res.message);
        
        // Refresh all data
        try {
          await Promise.all([
            fecthData(),
            fecthSalaryData()
          ]);
          
          // Trigger parent component data refresh
          if (onDataChange) {
            onDataChange();
          }
        } catch (error) {
          const msg = error?.response?.data?.message || error?.message || 'Có lỗi khi tải dữ liệu chấm công';
          console.error("Error fetching timesheet data:", msg);
          message.error(msg);
            }
      } else {
        throw new Error('Xóa ca làm thất bại');
      }
    } catch (error) {
      console.error('Error deleting timesheet:', error);
      message.error(error.message || 'Có lỗi khi xóa ca làm');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSalary = async () => {
    try {
        if (!salaryData) {
            message.error('Không có dữ liệu lương để lưu!');
            return;
        }

        // Format term to ensure MM/YYYY format
        const [month, year] = salaryData.term.split('/');
        const formattedTerm = `${month.padStart(2, '0')}/${year}`;

        const payload = {
            employeeId: record.employeeId,
            name: salaryData.employeeName,
            term: formattedTerm,
            baseSalary: salaryData.baseSalary,
            totalSalary: salaryData.totalSalary
        };

        const response = await createPayroll(payload);
        
        if (response.success) {
            message.success('Lưu phiếu lương thành công!');
            if (onDataChange) {
                onDataChange();
            }
            onCancel();
        } else {
            throw new Error(response.message);
        }
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Có lỗi khi lưu phiếu lương!';
        console.error('Error saving payroll:', error);
        message.error(errorMessage);
    }
  };

  const columns = [
    {
      title: 'STT',
      dataIndex: 'key',
      align: 'center',
      render: (text, record, index) => index + 1,
      width: 60,
    },
    {
      title: 'Ngày',
      dataIndex: 'day',
      align: 'center',
      render: (day) => formatDate(day),
      width: 120,
    },
    {
      title: 'Giờ vào',
      dataIndex: 'checkIn',
      align: 'center',
      width: 100,
    },
    {
      title: 'Giờ ra',
      dataIndex: 'checkOut',
      align: 'center',
      width: 100,
    },
    {
        title: 'Thưởng',
        dataIndex: 'bonus',
        align: 'center',
        width: 100,  
    },
    {
        title: 'Phạt',
        dataIndex: 'fine',
        align: 'center',
        width: 100,  
    },
    {
      title: 'Chức năng',
      key: 'action',
      align: 'center',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEditTimesheet(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa?"
            onConfirm={() => handleDelete(record)}
            okText="Có"
            cancelText="Không"
          >
            <Button 
              type="primary" 
              danger 
              size="small" 
              icon={<DeleteOutlined />}
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Modal
        title={`Chi tiết chấm công - ${record?.employeeName}`}
        open={visible}
        onCancel={onCancel}
        width={1000}
        footer={null}
      >
        {salaryData && (
          <Card 
            style={{ marginBottom: 16 }}
            extra={
              <Space>
                <Button 
                  type="primary" 
                  icon={<SaveOutlined />}
                  onClick={handleSaveSalary}
                >
                  Lưu phiếu lương
                </Button>
              </Space>
            }
          >
            <Descriptions title="Thông tin lương" bordered column={2}>
              <Descriptions.Item label="Kỳ lương">{salaryData.term}</Descriptions.Item>
              <Descriptions.Item label="Tên nhân viên">{salaryData.employeeName}</Descriptions.Item>
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

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>Chi tiết chấm công</h3>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddTimesheet}
          >
            Thêm chấm công
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={timeSheetData}
          loading={loading}
          pagination={{
            pageSize: 2,
            size: 'small',
            position: ['bottomCenter'],
            showSizeChanger: false,
            showTotal: (total) => `Tổng số: ${total} bản ghi`,
          }}
          bordered
          scroll={{ y: 300 }}
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
      </Modal>

      <ModalTimeSheetForm
        visible={timeSheetFormVisible}
        onCancel={handleTimeSheetFormCancel}
        onSubmit={handleTimeSheetFormSubmit}
        mode={timeSheetFormMode}
        initialValues={selectedTimeSheet}
        employeeId={record?.employeeId}
      />
    </>
  );
};

export default ModalDetail;
