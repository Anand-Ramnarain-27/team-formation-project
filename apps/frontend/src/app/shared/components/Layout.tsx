import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import styles from './Layout.module.css';

interface LayoutProps {
  userType: 'admin' | 'student';
}

const Layout: React.FC<LayoutProps> = ({ userType }) => {
  return (
    <div className={styles.layoutContainer}>
      <Navbar userType={userType} userName="Wesley Matthews" />
      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
