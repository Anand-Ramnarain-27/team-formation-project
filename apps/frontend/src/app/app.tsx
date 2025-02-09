import { Route, Routes, Link, Navigate } from 'react-router-dom';
import '@/app/styles/global.css'
import LoginPage from '@/app/shared/pages/LoginPage';
import AdminDashboard from '@/app/admin/pages/Dashboard';
import StudentDashboard from '@/app/student/pages/Dashboard'

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/student" element={<StudentDashboard />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;