import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import Login from '../../pages/login/Login';
import Dashboard from '../../pages/dashboard/Dashboard';
import ScheduleAssign from '../../pages/schedule/assign-schedule/AssignSchedule';
import ScheduleSet from '../../pages/schedule/set-schedule/SetSchedule';
import EmployeeList from '../../pages/employee/list-employee/ListEmployee';
import EmployeeInfor from '../../pages/employee/infor/Infor';
import PayrollList from '../../pages/payroll/list-payroll/ListPayroll';
import PayrollEmployee from '../../pages/payroll/employee-payroll/EmployeePayroll';
import { ProtectedRoute } from './ProtectedRoute';


const AppRoutes = () => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
      />
      <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
      <Route path="/schedule/assign" element={<ProtectedRoute element={<ScheduleAssign />} />} />
      <Route path="/schedule/set" element={<ProtectedRoute element={<ScheduleSet />} />} />
      <Route path="/employee/list" element={<ProtectedRoute element={<EmployeeList />} />} />
      <Route path="/employee/infor" element={<ProtectedRoute element={<EmployeeInfor />} />} />
      <Route path="/payroll/list" element={<ProtectedRoute element={<PayrollList />} />} />
      <Route path="/payroll/employee" element={<ProtectedRoute element={<PayrollEmployee />} />} />

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};

export default AppRoutes;
