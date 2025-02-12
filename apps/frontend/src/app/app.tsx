import { Route, Routes, Link, Navigate } from 'react-router-dom';
import '@/app/styles/global.css'
import LoginPage from '@/app/shared/pages/LoginPage';
import AdminDashboard from '@/app/admin/pages/Dashboard';
import AdminStudentsPage from '@/app/admin/pages/StudentManagement';
import AdminGroupsPage from '@/app/admin/pages/GroupManagement';
import AdminReviewPage from '@/app/admin/pages/Review';
import AdminAnalyticsPage from '@/app/admin/pages/Analytics';
import StudentDashboard from '@/app/student/pages/Dashboard';
import StudentVotePage from '@/app/student/pages/Vote';
import StudentReviewPage from '@/app/student/pages/Review';
import StudentProfilePage from '@/app/student/pages/Profile';
import Layout from '@/app/shared/components/Layout';
import Notifications from '@/app/shared/pages/Notifications';

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<Layout userType="admin" />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/students" element={<AdminStudentsPage />} />
        <Route path="/admin/review" element={<AdminReviewPage />} />
        <Route path="/admin/groups" element={<AdminGroupsPage />} />
        <Route path="/admin/notifications" element={<Notifications />} />
        <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
      </Route>
      <Route element={<Layout userType="student" />}>
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/student/vote" element={<StudentVotePage />} />
        <Route path="/student/review" element={<StudentReviewPage />} />
        <Route path="/student/notifications" element={<Notifications />} />
        <Route path="/student/profile" element={<StudentProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;