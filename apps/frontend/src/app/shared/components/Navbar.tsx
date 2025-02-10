import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Navbar.module.css';

const adminMenuItems = [
  { name: 'Dashboard', path: '/admin' },
  { name: 'Student Management', path: '/admin/students' },
  { name: 'Group Management', path: '/admin/groups' },
  { name: 'Review', path: '/admin/review' },
  { name: 'Analytics', path: '/admin/analytics' },
];

const studentMenuItems = [
  { name: 'Dashboard', path: '/student' },
  { name: 'Vote', path: '/student/vote' },
  { name: 'Group Assignment', path: '/student/groups' },
  { name: 'Review & Rating', path: '/student/review' },
  { name: 'Profile & History', path: '/student/profile' },
];

interface NavbarProps {
  userType: 'admin' | 'student';
  userName: string;
}

const Navbar: React.FC<NavbarProps> = ({ userType, userName }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuItems = userType === 'admin' ? adminMenuItems : studentMenuItems;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <button className={styles.hamburgerButton} onClick={toggleMobileMenu}>
        {isMobileMenuOpen ? '✕' : '☰'}
      </button>

      <div className={`${styles.navbar} ${styles.desktopNavbar}`}>
        <div className={styles.header}>
          <h2>Team Formation</h2>
        </div>
        <nav className={styles.menu}>
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `${styles.menuItem} ${isActive ? styles.active : ''}`
              }
            >
              <span className={styles.menuIcon}></span>
              {item.name}
            </NavLink>
          ))}
        </nav>
        <div className={styles.userSection}>
          <button
            className={styles.signOutButton}
            onClick={() => {
            }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className={`${styles.navbar} ${styles.mobileNavbar}`}>
          <div className={styles.header}>
            <h2>Team Formation</h2>
          </div>
          <nav className={styles.menu}>
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `${styles.menuItem} ${isActive ? styles.active : ''}`
                }
                onClick={toggleMobileMenu}
              >
                <span className={styles.menuIcon}></span>
                {item.name}
              </NavLink>
            ))}
          </nav>
          <div className={styles.userSection}>
            <button
              className={styles.signOutButton}
              onClick={() => {
                toggleMobileMenu();
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
