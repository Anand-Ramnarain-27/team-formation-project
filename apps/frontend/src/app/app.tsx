import { Route, Routes, Link, Navigate } from 'react-router-dom';
import '@/app/styles/global.css'
import LoginPage from '@/app/shared/pages/LoginPage';

export function App() {
  return (
    <div>
      <LoginPage />

    </div>
  );
}

export default App;