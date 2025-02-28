import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styles from './Navbar.module.css';
import Button from '@/app/shared/components/Button/Button';

const adminMenuItems = [
  { name: 'Dashboard', path: '/admin' },
  { name: 'User Management', path: '/admin/students' },
  { name: 'Group Management', path: '/admin/groups' },
  { name: 'Review', path: '/admin/review' },
  { name: 'Notifications', path: '/admin/notifications' },
  { name: 'Analytics', path: '/admin/analytics' },
];

const studentMenuItems = [
  { name: 'Dashboard', path: '/student' },
  { name: 'Vote', path: '/student/vote' },
  { name: 'Review & Rating', path: '/student/review' },
  { name: 'Notifications', path: '/student/notifications' },
  { name: 'Profile & History', path: '/student/profile' },
];

interface NavbarProps {
  userType: 'Admin' | 'Student';
  userName: string;
}

const Navbar: React.FC<NavbarProps> = ({ userType, userName }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuItems = userType === 'Admin' ? adminMenuItems : studentMenuItems;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navigate = useNavigate();

  const handleSignOut = () => {
    navigate('/login');
    window.location.reload();
  };

  return (
    <>
      <button className={styles.hamburgerButton} onClick={toggleMobileMenu}>
        {isMobileMenuOpen ? '✕' : '☰'}
      </button>

      <nav className={`${styles.navbar} ${styles.desktopNavbar}`}>
        <header className={styles.header}>
          <h1>Team Formation</h1>
        </header>
        <nav className={styles.menu}>
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `${styles.menuItem} ${isActive ? styles.active : ''}`
              }
              end={item.path === '/admin' || item.path === '/student'}
            >
              <span className={styles.menuIcon}></span>
              {item.name}
            </NavLink>
          ))}
        </nav>
        <footer className={styles.userSection}>
          <button className={styles.signOutButton} onClick={handleSignOut}>
            Sign Out
          </button>
        </footer>
      </nav>

      {isMobileMenuOpen && (
        <nav className={`${styles.navbar} ${styles.mobileNavbar}`}>
          <header className={styles.header}>
            <h2>Team Formation</h2>
          </header>
          <nav className={styles.menu}>
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `${styles.menuItem} ${isActive ? styles.active : ''}`
                }
                end={item.path === '/admin' || item.path === '/student'}
                onClick={toggleMobileMenu}
              >
                <span className={styles.menuIcon}></span>
                {item.name}
              </NavLink>
            ))}
          </nav>
          <footer className={styles.userSection}>
            <Button onClick={handleSignOut} className={styles.signOutButton}>
              Sign Out
            </Button>
          </footer>
        </nav>
      )}
    </>
  );
};

export default Navbar;
