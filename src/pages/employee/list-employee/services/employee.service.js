import apiClient from '../../../../common/api/apiClient'; // Import apiClient thay vì axios

const API_URL = '/employees'; // Chỉ cần endpoint, vì baseURL đã được cấu hình trong apiClient

export const getEmployee = async (page, limit, filter, sortBy = "name" , sortOrder = "asc") => {
  try {
    const response = await apiClient.get(API_URL, {
      params: {
        page,
        limit,
        name: filter.name || "",
        gender: filter.gender || "",
        position: filter.position || "",
        sortBy,
        sortOrder,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Lỗi không xác định!');
  }
};
export const getEmployeeById = async (id) => {
  try {
    const response = await apiClient.get(`/employees/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể tải thông tin nhân viên");
  }
};
export const addEmployee = async (employeeData) => {
  try {
    const response = await apiClient.post("/employees", employeeData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể thêm nhân viên");
  }
};
export const updateEmployee = async (id, employeeData) => {
  try {
    const response = await apiClient.put(`/employees/${id}`, employeeData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể cập nhật nhân viên");
  }
};

export const deleteEmployee = async (id) => {
  try {
    const response = await apiClient.delete(`/employees/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể xóa nhân viên");
  }
};

export const getEmployeeStatistics = async () => {
  try {
    const respone = await apiClient.get(`${API_URL}/statistics`);
    return respone.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể lấy thống kê nhân viên");
  }
}