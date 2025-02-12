// Dashboard.tsx
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
  colorClass: string;
}

const Dashboard: React.FC = () => {
  const [activeThemes] = useState<Theme[]>([
    {
      id: 1,
      name: "Theme Name",
      info: "Theme Info",
      status: "active",
      colorClass: "blue"
    },
    {
      id: 2,
      name: "Theme Name",
      info: "Theme Info",
      status: "voting",
      colorClass: "pink"
    },
    {
      id: 3,
      name: "Theme Name",
      info: "Theme Info",
      status: "review",
      colorClass: "green"
    },
    {
      id: 4,
      name: "Theme Name",
      info: "Theme Info",
      status: "completed",
      colorClass: "yellow"
    }
  ]);

  const [notifications] = useState<Notification[]>([
    {
      id: 1,
      title: "New Theme Submission",
      description: "A new theme has been submitted for review",
      type: "info",
      colorClass: "info"
    },
    {
      id: 2,
      title: "Voting Period Ended",
      description: "The voting period for Theme #123 has ended",
      type: "warning",
      colorClass: "warning"
    },
    {
      id: 3,
      title: "New Review Submitted",
      description: "A new review has been submitted for Group #456",
      type: "success",
      colorClass: "success"
    }
  ]);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1>Dashboard</h1>
        <div className={styles.headerActions}>
          <button className={styles.iconButton}>
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className={styles.statsGrid}>
        {[
          {
            title: "Total Students",
            value: "2,543",
            trend: "↑ 12% from last month",
            trendClass: "positive"
          },
          {
            title: "Active Themes",
            value: "8",
            trend: "3 in voting phase",
            trendClass: "neutral"
          },
          {
            title: "Total Groups",
            value: "156",
            trend: "Across all themes",
            trendClass: "neutral"
          },
          {
            title: "Pending Reviews",
            value: "27",
            trend: "Needs attention",
            trendClass: "warning"
          }
        ].map((stat, index) => (
          <div key={index} className={styles.statCard}>
            <div className={styles.statTitle}>{stat.title}</div>
            <div className={styles.statValue}>{stat.value}</div>
            <div className={`${styles.statTrend} ${styles[stat.trendClass]}`}>
              {stat.trend}
            </div>
          </div>
        ))}
      </div>

      {/* Themes Section */}
      <section className={styles.themesSection}>
        <div className={styles.sectionHeader}>
          <h2>Active Themes</h2>
          <button className={styles.addButton}>+ Add Theme</button>
        </div>
        <div className={styles.themesGrid}>
          {activeThemes.map((theme) => (
            <div key={theme.id} className={styles.themeCard}>
              <div className={`${styles.themeHeader} ${styles[theme.colorClass]}`}>
                <h3>{theme.name}</h3>
              </div>
              <div className={styles.themeContent}>
                <p>{theme.info}</p>
                <div className={styles.themeFooter}>
                  <span className={styles.themeStatus}>{theme.status}</span>
                  <button className={styles.viewButton}>View →</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Analytics and Notifications Grid */}
      <div className={styles.gridContainer}>
        {/* Analytics */}
        <div className={styles.analyticsCard}>
          <h3>Activity Overview</h3>
          <div className={styles.activityGrid}>
            <div className={styles.activityBox}>
              <h4>Recent Activity</h4>
              <ul>
                <li>New group formed in Theme #123</li>
                <li>15 new votes received</li>
                <li>3 reviews submitted</li>
              </ul>
            </div>
            <div className={styles.activityBox}>
              <h4>Upcoming Deadlines</h4>
              <ul>
                <li>Theme #456 voting ends in 2 days</li>
                <li>Group formation deadline tomorrow</li>
                <li>Review period starts in 3 days</li>
              </ul>
            </div>
          </div>
          <div className={styles.graphPlaceholder}>
            Activity Graph Placeholder
          </div>
        </div>

        {/* Notifications */}
        <div className={styles.notificationsCard}>
          <h3>Notifications</h3>
          <div className={styles.notificationsList}>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`${styles.notification} ${styles[notification.colorClass]}`}
              >
                <div className={styles.notificationHeader}>
                  <h4>{notification.title}</h4>
                  <button className={styles.closeButton}>×</button>
                </div>
                <p>{notification.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;