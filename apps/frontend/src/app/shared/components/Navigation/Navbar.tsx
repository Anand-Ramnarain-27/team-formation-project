import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styles from './Navbar.module.css';

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
  const navigate = useNavigate();
  
  // Close mobile menu when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSignOut = () => {
    navigate('/login');
    window.location.reload();
  };

  // Close mobile menu when clicking outside
  const handleOverlayClick = () => {
    setIsMobileMenuOpen(false);
  };

  // Check if current screen is mobile
  const isMobileScreen = () => {
    return window.innerWidth <= 768;
  };

  return (
    <>
      {/* Only render hamburger button on mobile screens */}
      <button 
        className={styles.hamburgerButton} 
        onClick={toggleMobileMenu}
        aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
      >
        {isMobileMenuOpen ? '✕' : '☰'}
      </button>

      {/* Desktop Navigation - always visible on desktop/laptop */}
      <nav className={`${styles.navbar} ${styles.desktopNavbar}`}>
        <div className={styles.header}>
          <h1>Team Formation</h1>
        </div>
        <div className={styles.menu}>
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
        </div>
        <div className={styles.userSection}>
          <button 
            className={styles.signOutButton} 
            onClick={handleSignOut}
          >
            Sign Out
          </button>
        </div>
      </nav>

      {/* Mobile Navigation - only rendered when mobile menu is open and on mobile screens */}
      {isMobileMenuOpen && (
        <>
          <div 
            className={`${styles.overlay} ${isMobileMenuOpen ? styles.active : ''}`}
            onClick={handleOverlayClick}
          ></div>
          <nav className={`${styles.navbar} ${styles.mobileNavbar}`}>
            <div className={styles.header}>
              <h2>Team Formation</h2>
            </div>
            <div className={styles.menu}>
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `${styles.menuItem} ${isActive ? styles.active : ''}`
                  }
                  end={item.path === '/admin' || item.path === '/student'}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className={styles.menuIcon}></span>
                  {item.name}
                </NavLink>
              ))}
            </div>
            <div className={styles.userSection}>
              <button 
                className={styles.signOutButton} 
                onClick={handleSignOut}
              >
                Sign Out
              </button>
            </div>
          </nav>
        </>
      )}
    </>
  );
};

export default Navbar;