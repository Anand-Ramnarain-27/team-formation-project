import React, { useState } from 'react';
import styles from './Dashboard.module.css';
import ThemeModals from '../components/ThemeModals';

// Types based on database schema
interface User {
  user_id: number;
  name: string;
  email: string;
  role: string;
}

interface Theme {
  theme_id: number;
  title: string;
  description: string;
  submission_deadline: string;
  voting_deadline: string;
  review_deadline: any; // JSON type in DB
  number_of_groups: number;
  auto_assign_group: boolean;
}

interface Idea {
  idea_id: number;
  theme_id: number;
  idea_name: string;
  description: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

interface AnalyticsReport {
  report_id: number;
  theme_id: number;
  total_students: number;
  total_reports: number;
  average_rating: number;
  participation_stats: any; // JSON type in DB
}

interface Notification {
  notification_id: number;
  recipient_role: string;
  message: string;
  created_at: string;
}

const Dashboard: React.FC = () => {
  // Mock data based on database schema
  const [activeThemes] = useState<Theme[]>([
    {
      theme_id: 1,
      title: 'Innovation in Education',
      description: 'Exploring new teaching methodologies',
      submission_deadline: '2025-03-01',
      voting_deadline: '2025-03-15',
      review_deadline: { start: '2025-03-16', end: '2025-03-30' },
      number_of_groups: 10,
      auto_assign_group: true,
    },
    {
      theme_id: 2,
      title: 'Sustainable Development',
      description: 'Projects focusing on environmental sustainability',
      submission_deadline: '2025-04-01',
      voting_deadline: '2025-04-15',
      review_deadline: { start: '2025-04-16', end: '2025-04-30' },
      number_of_groups: 8,
      auto_assign_group: false,
    },
  ]);

  const [analyticsData] = useState<AnalyticsReport>({
    report_id: 1,
    theme_id: 1,
    total_students: 2543,
    total_reports: 156,
    average_rating: 4.2,
    participation_stats: {
      ideas_submitted: 45,
      votes_cast: 1200,
      reviews_submitted: 450,
    },
  });

  const [notifications] = useState<Notification[]>([
    {
      notification_id: 1,
      recipient_role: 'admin',
      message: 'New theme ideas require review',
      created_at: '2025-02-17T10:00:00Z',
    },
    {
      notification_id: 2,
      recipient_role: 'admin',
      message: 'Voting period ending soon for Theme #1',
      created_at: '2025-02-17T09:30:00Z',
    },
    {
      notification_id: 3,
      recipient_role: 'admin',
      message: 'New peer reviews submitted for Group #5',
      created_at: '2025-02-17T09:00:00Z',
    },
  ]);

  const handleThemeCreate = (newTheme: Omit<Theme, 'theme_id'>) => {
    // Add API call to create theme
    console.log('Creating theme:', newTheme);
  };

  const handleThemeUpdate = (updatedTheme: Theme) => {
    // Add API call to update theme
    console.log('Updating theme:', updatedTheme);
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1>Theme Management Dashboard</h1>
        <div className={styles.headerActions}>
          <button className={styles.iconButton}>
            <svg
              viewBox="0 0 24 24"
              width="24"
              height="24"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statTitle}>Total Students</div>
          <div className={styles.statValue}>{analyticsData.total_students}</div>
          <div className={`${styles.statTrend} ${styles.positive}`}>
            Active in current themes
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statTitle}>Average Rating</div>
          <div className={styles.statValue}>
            {analyticsData.average_rating}/5.0
          </div>
          <div className={`${styles.statTrend} ${styles.neutral}`}>
            Based on {analyticsData.total_reports} reviews
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statTitle}>Ideas Submitted</div>
          <div className={styles.statValue}>
            {analyticsData.participation_stats.ideas_submitted}
          </div>
          <div className={`${styles.statTrend} ${styles.neutral}`}>
            Across all themes
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statTitle}>Pending Reviews</div>
          <div className={styles.statValue}>
            {analyticsData.participation_stats.reviews_submitted}
          </div>
          <div className={`${styles.statTrend} ${styles.warning}`}>
            Reviews submitted
          </div>
        </div>
      </div>

      {/* Active Themes Section */}
      <section className={styles.themesSection}>
        <div className={styles.sectionHeader}>
          <h2>Active Themes</h2>
          <ThemeModals
            onThemeCreate={handleThemeCreate}
            onThemeUpdate={handleThemeUpdate}
          />
          <button className={styles.addButton}>+ Create New Theme</button>
        </div>
        <div className={styles.themesGrid}>
          {activeThemes.map((theme) => (
            <div key={theme.theme_id} className={styles.themeCard}>
              <div className={`${styles.themeHeader} ${styles.blue}`}>
                <h3>{theme.title}</h3>
              </div>
              <div className={styles.themeContent}>
                <p>{theme.description}</p>
                <div className={styles.themeFooter}>
                  <span className={styles.themeStatus}>
                    {new Date(theme.voting_deadline) > new Date()
                      ? 'Voting'
                      : 'Review Phase'}
                  </span>
                  <button className={styles.viewButton}>Manage →</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Analytics and Notifications Grid */}
      <div className={styles.gridContainer}>
        <div className={styles.analyticsCard}>
          <h3>Activity Overview</h3>
          <div className={styles.activityGrid}>
            <div className={styles.activityBox}>
              <h4>Participation Stats</h4>
              <ul>
                <li>
                  {analyticsData.participation_stats.votes_cast} votes cast
                </li>
                <li>
                  {analyticsData.participation_stats.ideas_submitted} ideas
                  submitted
                </li>
                <li>
                  {analyticsData.participation_stats.reviews_submitted} reviews
                  completed
                </li>
              </ul>
            </div>
            <div className={styles.activityBox}>
              <h4>Upcoming Deadlines</h4>
              <ul>
                {activeThemes.map((theme) => (
                  <li key={theme.theme_id}>
                    {theme.title}: Voting ends{' '}
                    {new Date(theme.voting_deadline).toLocaleDateString()}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className={styles.notificationsCard}>
          <h3>Recent Notifications</h3>
          <div className={styles.notificationsList}>
            {notifications.map((notification) => (
              <div
                key={notification.notification_id}
                className={`${styles.notification} ${styles.info}`}
              >
                <div className={styles.notificationHeader}>
                  <h4>{notification.message}</h4>
                  <button className={styles.closeButton}>×</button>
                </div>
                <p>{new Date(notification.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
