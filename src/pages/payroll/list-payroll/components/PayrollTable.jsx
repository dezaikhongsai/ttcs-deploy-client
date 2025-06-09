import React, { useState, useEffect } from 'react';
import { Table, Button, Space, message, Popconfirm, DatePicker, Card } from 'antd';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { getAllPayrollInTerm, deletePayroll } from '../services/payroll.service';
import ModalDetail from './ModalDetail';
import dayjs from 'dayjs';

const PayrollTable = ({ onDataChange }) => {
    const [loading, setLoading] = useState(false);
    const [payrollData, setPayrollData] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [selectedTerm, setSelectedTerm] = useState(dayjs()); // Mặc định là tháng hiện tại

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value) + ' VND';
    };
    
    const fetchPayrollData = async () => {
        if (!selectedTerm) return;
        
        try {
            setLoading(true);
            // Format term to MM/YYYY before sending to API
            const formattedTerm = selectedTerm.format('MM/YYYY');
            const response = await getAllPayrollInTerm(formattedTerm);
            if (response.success) {
                setPayrollData(response.data);
            } else {
                throw new Error(response.message || 'Không thể tải dữ liệu bảng lương');
            }
        } catch (error) {
            console.error('Error fetching payroll data:', error);
            message.error(error.message || 'Có lỗi khi tải dữ liệu bảng lương');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayrollData();
    }, [selectedTerm]);

    const handleTermChange = (date) => {
        setSelectedTerm(date);
    };

    const handleDelete = async (record) => {
        try {
            const response = await deletePayroll(record._id);
            if (response.success) {
                message.success('Xóa bảng lương thành công');
                fetchPayrollData(); // Refresh data
                if (onDataChange) onDataChange();
            } else {
                throw new Error(response.message || 'Xóa bảng lương thất bại');
            }
        } catch (error) {
            console.error('Error deleting payroll:', error);
            message.error(error.message || 'Có lỗi khi xóa bảng lương');
        }
    };

    const handleViewDetail = (record) => {
        setSelectedRecord(record);
        setModalVisible(true);
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
            title: 'Tên nhân viên',
            dataIndex: 'name',
            key: 'name',
            width: 200
        },
        {
            title: 'Kỳ lương',
            dataIndex: 'term',
            key: 'term',
            width: 120,
            align: 'center'
        },
        {
            title: 'Lương cơ bản',
            dataIndex: ['calculatedValues', 'baseSalary'],
            key: 'baseSalary',
            width: 150,
            align: 'right',
            render: (value) => formatCurrency(value)
        },
        {
            title: 'Tổng lương',
            dataIndex: ['calculatedValues', 'totalSalary'],
            key: 'totalSalary',
            width: 150,
            align: 'right',
            render: (value) => formatCurrency(value)
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            align: 'center'
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 150,
            align: 'center',
            render: (_, record) => (
                <Space>
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa bảng lương này?"
                        onConfirm={() => handleDelete(record)}
                        okText="Có"
                        cancelText="Không"
                    >
                        <Button
                            type="primary"
                            danger
                            icon={<DeleteOutlined />}
                        >
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    const totalSalaryAll = payrollData.reduce((sum, item) => 
        sum + (item.calculatedValues?.totalSalary || 0), 0);

    return (
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
                <div>
                    <span style={{ marginRight: 8 }}>
                        Tổng số bảng lương: <strong>{payrollData.length}</strong>
                    </span>
                </div>
                <div style={{ marginBottom: 16, textAlign: 'right', fontWeight: 'bold', fontSize: 16 }}>
                    Tổng lương kỳ này: {formatCurrency(totalSalaryAll)}
                </div>
            </div>

            <Table
                columns={columns}
                dataSource={payrollData}
                loading={loading}
                rowKey="_id"
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng số: ${total} bản ghi`,
                }}
                scroll={{ x: 1200 }}
            />

            <ModalDetail
                visible={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    setSelectedRecord(null);
                }}
                record={selectedRecord}
                onDataChange={() => {
                    fetchPayrollData();
                    if (onDataChange) onDataChange();
                }}
            />
        </Card>
    );
};

export default PayrollTable;
