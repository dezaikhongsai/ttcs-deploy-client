import apiClient from '../../../../common/api/apiClient';

const assignmentApi = '/assignment';
const shiftApi = '/shifts';
const employeeApi = '/employees';
export const getAssignments = async () => {
    try {
        const respone = await apiClient.get(assignmentApi);
        return respone.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Lỗi không xác định!');
    }
}

export const updateAssignment = async (id, data) => {
    try {
        const respone = await apiClient.put(`${assignmentApi}/status/${id}`, data);
        return respone.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Lỗi không xác định!');
    }
}

export const createShift = async(data) => {
    try {
        const respone = await apiClient.post(shiftApi, data);
        return respone.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Lỗi không xác định!');
    }
}
export const deleteAssignment = async(id) => {
    try {
        const respone = await apiClient.delete(`${assignmentApi}/${id}`);
        return respone.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Lỗi không xác định!');
    }
}
export const getShifts = async () => {
    try {
        const response = await apiClient.get(shiftApi);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Lỗi không xác định!');
    }
}

export const deleteShift = async (id) => {
    try {
        const respone = await apiClient.delete(`${shiftApi}/${id}`);
        return respone.data;
    } catch (error) {
        throw new Error(error.respone?.data?.message || 'Lỗi không xác định')
    }
}
export const getEmployeeWithPosition = async () => {
    try {
        const response = await apiClient.get(`${employeeApi}/with-position`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Lỗi không xác định!');
    }
}

export const updateShiftByWorkSchedule = async (data) => {
    try {
        const response = await apiClient.put('/shifts/update-employees', data);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Lỗi không xác định!');
    }
}
export const deleteWorkScheduleInShift = async (data) => {
    try {
        const response = await apiClient.delete('/shifts/work-schedule', {
            params: {
                day: data.day,
                workScheduleId: data.workScheduleId
            }
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Lỗi không xác định!');
    }
}

export const getWorkSchedule = async () => {
  try {
    const response = await apiClient.get('/workSchedule'); // Đảm bảo endpoint đúng
    return response.data.data; // Trả về mảng từ API
  } catch (error) {
    console.error('Lỗi khi gọi API getWorkSchedule:', error);
    throw error;
  }
};