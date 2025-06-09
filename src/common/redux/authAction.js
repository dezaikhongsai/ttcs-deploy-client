// src/common/redux/actions/authActions.js
import axios from 'axios';
import { logoutSuccess } from './authSlice';
export const logoutUser = () => {
  const URL = import.meta.env.VITE_API_URL + '/api/auth/logout'; // Đường dẫn API logout
  return async (dispatch) => {
    try {
      await axios.post(URL, {}, { withCredentials: true });
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      dispatch(logoutSuccess());
    }
  };
};
