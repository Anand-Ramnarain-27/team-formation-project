// DashboardContent.tsx
import React, { useState } from 'react';
import styles from './Dashboard.module.css';

interface Theme {
  id: number;
  name: string;
  info: string;
  status: string;
  colorClass: string;
}

interface Notification {
  id: number;
  title: string;
  description: string;
  type: string;
}

const Dashboard: React.FC = () => {
  const [themes] = useState<Theme[]>([
    {
      id: 1,
      name: 'Theme Name',
      info: 'Theme info',
      status: 'active',
      colorClass: styles.blueTheme
    },
    {
      id: 2,
      name: 'Theme Name',
      info: 'Theme info',
      status: 'pending',
      colorClass: styles.pinkTheme
    },
    {
      id: 3,
      name: 'Theme Name',
      info: 'Theme info',
      status: 'completed',
      colorClass: styles.greenTheme
    },
    {
      id: 4,
      name: 'Theme Name',
      info: 'Theme info',
      status: 'upcoming',
      colorClass: styles.yellowTheme
    }
  ]);

  const [notifications] = useState<Notification[]>([
    {
      id: 1,
      title: 'Notification Title',
      description: 'Part of the Notification',
      type: 'info'
    },
    {
      id: 2,
      title: 'Notification Title',
      description: 'Part of the Notification',
      type: 'warning'
    },
    {
      id: 3,
      title: 'Notification Title',
      description: 'Part of the Notification',
      type: 'success'
    }
  ]);

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <div className={styles.header}>
        <h1 className={styles.title}>Themes</h1>
        <div className={styles.dateNav}>
          <span>June 26th, 2020</span>
          <div className={styles.arrows}>
            <button className={styles.arrowButton}>←</button>
            <button className={styles.arrowButton}>→</button>
          </div>
        </div>
      </div>

      {/* Top Section: Themes Grid and Notifications */}
      <div className={styles.topSection}>
        {/* Themes Grid */}
        <div className={styles.themesGrid}>
          {themes.map((theme) => (
            <div key={theme.id} className={`${styles.themeCard} ${theme.colorClass}`}>
              <h3 className={styles.themeTitle}>{theme.name}</h3>
              <p className={styles.themeInfo}>{theme.info}</p>
              <div className={styles.themeFooter}>
                <button className={styles.viewButton}>View</button>
                <span className={styles.status}>{theme.status}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Notifications Card */}
        <div className={styles.notificationsCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Notifications</h2>
          </div>
          <div className={styles.notificationsContent}>
            {notifications.map((notification) => (
              <div key={notification.id} className={styles.notification}>
                <div className={styles.notificationContent}>
                  <h4 className={styles.notificationTitle}>{notification.title}</h4>
                  <p className={styles.notificationDescription}>{notification.description}</p>
                </div>
                <button className={styles.closeButton}>×</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section: Theme Status and Group Cards */}
      <div className={styles.bottomSection}>
        {/* Theme Status Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Theme Name</h2>
          </div>
          <div className={styles.cardContent}>
            <p className={styles.cardDescription}>
              Status of project (voting, submitting ideas, review ideas, waiting for reviews)
            </p>
            <div className={styles.scrollArea}>
              {/* Add project status items here */}
            </div>
          </div>
        </div>

        {/* Group Information Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Group Name</h2>
          </div>
          <div className={styles.cardContent}>
            <p className={styles.cardDescription}>
              List of people in your group
            </p>
            <div className={styles.scrollArea}>
              {/* Add group members list here */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;