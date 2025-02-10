import { Route, Routes, Link, Navigate } from 'react-router-dom';
import '@/app/styles/global.css'
import LoginPage from '@/app/shared/pages/LoginPage';
import AdminDashboard from '@/app/admin/pages/Dashboard';
import StudentDashboard from '@/app/student/pages/Dashboard'
import Layout from '@/app/shared/components/Layout';

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<Layout userType="admin" />}>
        <Route path="/admin" element={<AdminDashboard />} />
        {/* <Route path="/admin/students" element={<AdminStudentsPage />} />
        <Route path="/admin/groups" element={<AdminGroupsPage />} />
        <Route path="/admin/review" element={<AdminReviewPage />} />
        <Route path="/admin/analytics" element={<AdminAnalyticsPage />} /> */}
      </Route>
      <Route element={<Layout userType="student" />}>
        <Route path="/student" element={<StudentDashboard />} />
        {/* <Route path="/student/team" element={<StudentTeamPage />} />
        <Route path="/student/vote" element={<StudentVotePage />} />
        <Route path="/student/groups" element={<StudentGroupsPage />} />
        <Route path="/student/review" element={<StudentReviewPage />} />
        <Route path="/student/profile" element={<StudentProfilePage />} /> */}
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;