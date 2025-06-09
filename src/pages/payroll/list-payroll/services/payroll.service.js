import apiClinet from '../../../../common/api/apiClient';

export const getSalaryAllEmployee = async (month , year) => {
    try {
        const res = await apiClinet.get(`/timesheet/salary?month=${month}&year=${year}`);
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Lỗi không xác định");
    }
}

export const getSalaryByEmployeeId = async (employeeId , month , year) => {
    try {
        const res = await apiClinet.get(`/timesheet/salary/${employeeId}?month=${month}&year=${year}`);
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Lỗi không xác định");
    }
}
export const getTimeSheetByEmployeeId = async (employeeId , month , year) => {
    try {
        const res = await apiClinet.get(`/timesheet/employee/${employeeId}?month=${month}&year=${year}`);
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Lỗi không xác định");
    }
}


export const getWorkSchedule = async () => {
    try {
      const response = await apiClinet.get('/workSchedule'); // Đảm bảo endpoint đúng
      return response.data.data; // Trả về mảng từ API
    } catch (error) {
      console.error('Lỗi khi gọi API getWorkSchedule:', error);
      throw error;
    }
};
export const createTimeSheet = async (data) => {
    try {
        const res = await apiClinet.post('/timesheet', data);
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Lỗi không xác định");
    }
}
export const updateTimeSheet = async (id, data) => {
    try {
        const res = await apiClinet.put(`/timesheet/${id}`, data);
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Lỗi không xác định");
    }
}

export const deleteTimeSheet = async (id) => {
    try {
        const res = await apiClinet.delete(`/timesheet/${id}`);
        return res.data;
    }
    catch (error) {
        throw new Error(error.response?.data?.message || "Lỗi không xác định");
    }
}

export const createPayroll = async (data) => {
    const res = await apiClinet.post('/payroll', data);
    return res.data;
}

export const getAllPayrollInTerm = async (term) => {
    const res = await apiClinet.get(`/payroll?term=${term}`);
    return res.data;
}

export const deletePayroll = async (id) => {
    const res = await apiClinet.delete(`/payroll/${id}`);
    return res.data;
}