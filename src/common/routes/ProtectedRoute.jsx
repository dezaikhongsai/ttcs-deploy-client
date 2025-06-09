import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';

export const ProtectedRoute = ({ element }) => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  return isAuthenticated ? <MainLayout>{element}</MainLayout> : <Navigate to="/login" />;
};