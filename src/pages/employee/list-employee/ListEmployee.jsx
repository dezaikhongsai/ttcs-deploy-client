import React, { useState, useEffect, useCallback } from "react";
import { Table, Button, Space, message, Select, Row, Col, Input, Tag, Modal } from "antd";
import { EditOutlined, EyeOutlined, DeleteOutlined, FilterOutlined, BarChartOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { getEmployee, getEmployeeById, addEmployee, updateEmployee, deleteEmployee, getEmployeeStatistics } from "./services/employee.service.js";
import ModalFilter from "./components/ModalFilter";
import ModalEmployee from "./components/ModalEmployee";
import debounce from "lodash.debounce";
import ModalEmployeeForm from "./components/ModalEmployeeForm";
import QuickStatistics from "./components/EmployeeStatistic.jsx";
const EmployeeTable = () => {
  const { Option } = Select;
  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    pageSizeOptions: ["2", "5", "10"],
    showSizeChanger: true,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
  });
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState("asc");
  const [searchName, setSearchName] = useState("");
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState({ gender: "", position: "" });
  const [filterTags, setFilterTags] = useState([]);
  const [trigger, setTrigger] = useState(false);
  const [isEmployeeModalVisible, setIsEmployeeModalVisible] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isEmployeeFormVisible, setIsEmployeeFormVisible] = useState(false);
  const [employeeFormMode, setEmployeeFormMode] = useState(1);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [viewMode, setViewMode] = useState('list'); 

  const fetchEmployees = async (page = 1, pageSize = 10, filters = {}, sortBy = "name", sortOrder = "asc") => {
    setLoading(true);
    try {
      const { data, pagination: paginationData } = await getEmployee(page, pageSize, filters, sortBy, sortOrder);
      setEmployees(data);
      setPagination((prev) => ({
        ...prev,
        current: paginationData.currentPage,
        pageSize: paginationData.limit,
        total: paginationData.totalRecords,
      }));
    } catch (error) {
      message.error("Failed to fetch employees");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (trigger) {
      fetchEmployees(pagination.current, pagination.pageSize, { ...filters, name: searchName }, "name", sortOrder);
      setTrigger(false);
    }
  }, [trigger]);
  useEffect(() => { 
    const fetchStatistics = async () => {
      try {
        const response = await getEmployeeStatistics();
        setStatistics(response.data);
      } catch (error) {
        message.error("Không thể tải thống kê nhân viên");
      }
    };
    fetchStatistics();
  }, []);

  useEffect(() => {
    setTrigger(true);
  }, []);

  const handleViewEmployee = async (id) => {
    try {
      setLoading(true);
      const response = await getEmployeeById(id);
      setSelectedEmployee(response);
      setIsEmployeeModalVisible(true);
    } catch (error) {
      message.error("Không thể tải thông tin nhân viên");
    } finally {
      setLoading(false);
    }
  };
  const debounceSearch = useCallback(
    debounce((value) => {
      setSearchName(value); 
      setTrigger(true); 
    }, 500), 
    []
  );
  
  const handleSearch = (e) => {
    const value = e.target.value; 
    debounceSearch(value); 
  };

  const handleCloseEmployeeModal = () => {
    setIsEmployeeModalVisible(false);
    setSelectedEmployee(null);
  };

  const handleFilter = () => {
    setIsFilterModalVisible(true); 
  };
  const handleSortChange = (value) => {
    setSortOrder(value); 
    setTrigger(true); 
  };
  
  const handleTableChange = (pagination, filters, sorter) => {
    const { current, pageSize } = pagination;
    setPagination((prev) => ({
      ...prev,
      current,
      pageSize,
    }));
    if (sorter.field) {
      const sortBy = sorter.field;
      const sortOrder = sorter.order === "ascend" ? "asc" : "desc";
      setSortOrder(sortOrder);
    }
    setTrigger(true);
  };
  const handleFilterCancel = () => {
    setIsFilterModalVisible(false); 
  };
  const handleFilterApply = (values) => {
    setFilters(values); 
    setIsFilterModalVisible(false);         
    const tags = [];
    if (values.gender) {
      tags.push({ key: "gender", label: `Giới tính: ${values.gender}` });
    }
    if (values.position) {
      tags.push({ key: "position", label: `Chức vụ: ${values.position}` });
    }
    setFilterTags(tags); 
    setTrigger(true); 
  };
  
  const handleRemoveTag = (key) => {
    const updatedFilters = { ...filters };
    delete updatedFilters[key]; 
    setFilters(updatedFilters); 
    const updatedTags = filterTags.filter((tag) => tag.key !== key);
    setFilterTags(updatedTags);
    setTrigger(true); 
  };
  const handleOpenAddEmployeeModal = () => {
    setEmployeeFormMode(1);
    setEditingEmployee(null);
    setIsEmployeeFormVisible(true);
  };

  const handleOpenEditEmployeeModal = (employee) => {
    setEmployeeFormMode(2);
    setEditingEmployee(employee);
    setSelectedEmployee(employee);
    setIsEmployeeFormVisible(true);
  };
  useEffect(() => {
  if (employeeFormMode === 2 && editingEmployee) {
    setIsEmployeeFormVisible(true);
  }
}, [employeeFormMode, editingEmployee]);

  const handleCloseEmployeeFormModal = () => {
    setIsEmployeeFormVisible(false);
  };

  const handleSubmitEmployeeForm = async (employeeData) => {
    try {
      if (employeeFormMode === 1) {
        await addEmployee(employeeData); 
        message.success("Thêm nhân viên thành công!");
      } else {
        await updateEmployee(editingEmployee._id, employeeData) 
        message.success("Cập nhật thông tin nhân viên thành công!");
      }
      setTrigger(true); 
      handleCloseEmployeeFormModal(); 
    } catch (error) {
      message.error("Không thể xử lý yêu cầu!");
    }
  };

  const handleDeleteEmployee = (employee) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc chắn muốn xóa nhân viên "${employee.name}"?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await deleteEmployee(employee._id);
          message.success('Xóa nhân viên thành công');
          // Cập nhật lại danh sách và thống kê
          setTrigger(true);
          // Cập nhật lại thống kê
          const response = await getEmployeeStatistics();
          setStatistics(response.data);
        } catch (error) {
          message.error('Không thể xóa nhân viên');
          console.error('Error deleting employee:', error);
        }
      },
    });
  };

  const columns = [
    {
      title: "STT",
      dataIndex: "stt",
      align: "center",
      key: "stt",
      render: (text, record, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "Tên",
      dataIndex: "name",
      align: "center",
      key: "name",
      sorter: true,
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      align: "center",
      key: "gender",
    },
    {
      title: "Chức vụ",
      dataIndex: "position",
      align: "center",
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
    },
    {
      title: "Ngày sinh",
      dataIndex: "dob",
      align: "center",
      key: "dob",
      render: (text) => new Date(text).toLocaleDateString("vi-VN"),
    },
    {
      title: "Số điện thoại",
      dataIndex: "phoneContact",
      align: "center",
      key: "phoneContact",
    },
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      render: (text, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => handleViewEmployee(record._id)}
          >
            Xem
          </Button>
          <Button
            type="default"
            icon={<EditOutlined />}
            style={{
              backgroundColor: "#facc15",
              color: "white",
              border: "none",
              padding: "6px 12px",
              borderRadius: "4px",
              cursor: "pointer",
              transition: "background-color 0.3s ease",
            }}
              onClick={() => {handleOpenEditEmployeeModal(record) ; console.log("Chỉnh sửa : " , record)}}
            >
            Sửa
          </Button>
          <Button
            type="danger"
            icon={<DeleteOutlined />}
            style={{
              backgroundColor: "#ff4d4f",
              color: "white",
              border: "none",
              padding: "6px 12px",
              borderRadius: "4px",
            }}
            onClick={() => handleDeleteEmployee(record)} // Gọi hàm xử lý xóa
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4">
      {/* Nút chuyển đổi view */}
      <Row justify="start" className="mb-4">
        <Button
          type={viewMode === 'list' ? 'primary' : 'default'}
          icon={<UnorderedListOutlined />}
          onClick={() => setViewMode('list')}
          style={{ marginRight: '8px' }}
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
      </Row>

      {viewMode === 'statistics' ? (
        <QuickStatistics statistics={statistics} />
      ) : (
        <>
          <Row className="mb-4">
            {filterTags.map((tag) => (
              <Tag
                key={tag.key}
                closable
                onClose={() => handleRemoveTag(tag.key)}
              >
                {tag.label}
              </Tag>
            ))}
          </Row>
          <Row justify="space-between" align="middle" className="mb-4">
            <Col>
              <Input.Search 
                placeholder="Tìm kiếm theo tên" 
                allowClear 
                onChange={handleSearch} 
                style={{ width: 300 }} 
              />
              <Button
                type="primary"
                onClick={handleFilter}
                style={{ marginLeft: 10, width: 85 }}
                icon={<FilterOutlined />}
              >
                Lọc
              </Button>
            </Col>
            <Col>
              <Select defaultValue="asc" style={{ width: 200 }} onChange={handleSortChange}>
                <Option value="asc">Sắp xếp tăng dần</Option>
                <Option value="desc">Sắp xếp giảm dần</Option>
              </Select>
              <Button
                type="primary"
                style={{ marginLeft: 10 }}
                onClick={handleOpenAddEmployeeModal}
              >
                Thêm nhân viên
              </Button>
            </Col>
          </Row>
          <Table
            columns={columns}
            dataSource={employees}
            pagination={{
              ...pagination,
              position: ["bottomCenter"],
            }}
            loading={loading}
            onChange={handleTableChange}
            rowKey="_id"
            className="shadow-md rounded-lg"
            scroll={{ x: "max-content" }}
          />
        </>
      )}

      <ModalFilter
        visible={isFilterModalVisible}
        onCancel={handleFilterCancel}
        onApply={handleFilterApply}
      />
      <ModalEmployee
        visible={isEmployeeModalVisible}
        onClose={handleCloseEmployeeModal}
        employee={selectedEmployee}
      />
      <ModalEmployeeForm
      visible={isEmployeeFormVisible}
      onClose={handleCloseEmployeeFormModal}
      onSubmit={handleSubmitEmployeeForm}
      mode={employeeFormMode}
      employeeData={selectedEmployee }
    />
    </div>
  );
};

export default EmployeeTable;