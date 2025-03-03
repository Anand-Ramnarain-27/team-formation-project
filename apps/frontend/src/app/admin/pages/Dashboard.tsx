import React, { useState, useEffect } from 'react';
import styles from './Dashboard.module.css';
import { ThemeModal } from '@/app/admin/components/ThemeModals';
import {
  Theme,
  BaseTheme,
  AnalyticsReport,
  Notification,
  User,
} from '@/app/shared/utils/types';
import Card from '@/app/shared/components/Card/Card';
import Button from '@/app/shared/components/Button/Button';
import NotificationCard from '@/app/shared/components/NotificationCard/NotificationCard';

const Dashboard: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<Theme | undefined>();
  const [activeThemes, setActiveThemes] = useState<Theme[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsReport | null>(
    null
  );
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Get the current user from localStorage
  useEffect(() => {
    const userJson = localStorage.getItem('currentUser');

    if (!userJson) {
      setError("You're not logged in. Please log in to view notifications.");
      return;
    }

    try {
      const user = JSON.parse(userJson) as User;
      setCurrentUser(user);
    } catch (err) {
      setError('Invalid user data. Please log in again.');
      localStorage.removeItem('currentUser');
    }
  }, []);

  const isAdmin = currentUser?.role === 'Admin';
  const userId = currentUser?.user_id;
  const userRole = currentUser?.role;

  // Fetch themes data
  const fetchThemes = async () => {
    try {
      const response = await fetch('http://localhost:7071/api/theme');
      if (!response.ok) {
        throw new Error('Failed to fetch themes');
      }
      const data = await response.json();
      setActiveThemes(data);
    } catch (err) {
      setError('Error fetching themes data');
      console.error(err);
    }
  };

  // Fetch analytics data
  const fetchAnalytics = async () => {
    try {
      const response = await fetch(
        `http://localhost:7071/api/analyticsReport?id=19`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      const data = await response.json();
      setAnalyticsData(data);
    } catch (err) {
      setError('Error fetching analytics data');
      console.error(err);
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await fetch(
        `http://localhost:7071/api/notification?user_id=${userId}&user_role=${userRole}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      const data = await response.json();
      setNotifications(data);
    } catch (err) {
      setError('Error fetching notifications');
      console.error(err);
    }
  };

  // Load all data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchThemes(),
        fetchAnalytics(),
        fetchNotifications(),
      ]);
      setIsLoading(false);
    };

    loadData();
  }, [userId, userRole]);

  // Create a new theme
  const handleCreateTheme = async (newTheme: BaseTheme) => {
    try {
      const themeWithCreator = {
        ...newTheme,
        created_by: userId,
      };

      const response = await fetch('http://localhost:7071/api/theme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(themeWithCreator),
      });

      if (!response.ok) {
        throw new Error('Failed to create theme');
      }

      const createdTheme = await response.json();
      setActiveThemes((prev) => [...prev, createdTheme]);
    } catch (err) {
      setError('Error creating theme');
      console.error(err);
    }
  };

  // Edit an existing theme
  const handleEditTheme = async (updatedTheme: BaseTheme) => {
    if (!selectedTheme) return;

    try {
      const themeWithCreator = {
        ...updatedTheme,
        created_by: selectedTheme.created_by,
      };

      const response = await fetch(
        `http://localhost:7071/api/theme?id=${selectedTheme.theme_id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(themeWithCreator),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update theme');
      }

      const updatedThemeData = await response.json();
      setActiveThemes((prev) =>
        prev.map((t) =>
          t.theme_id === selectedTheme.theme_id ? updatedThemeData : t
        )
      );
    } catch (err) {
      setError('Error updating theme');
      console.error(err);
    }
  };

  const handleManageTheme = (theme: Theme) => {
    setSelectedTheme(theme);
    setIsEditModalOpen(true);
  };

  if (isLoading) {
    return <div className={styles.loading}>Loading dashboard data...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1>Theme Management Dashboard</h1>
      </header>

      <section className={styles.statsGrid}>
        {analyticsData && (
          <>
            <Card>
              <h3 className={styles.statTitle}>Total Students</h3>
              <p className={styles.statValue}>{analyticsData.total_students}</p>
              <p className={`${styles.statTrend} ${styles.positive}`}>
                Active in current themes
              </p>
            </Card>
            <Card>
              <h3 className={styles.statTitle}>Average Rating</h3>
              <p className={styles.statValue}>
                {analyticsData.average_rating}/5.0
              </p>
              <p className={`${styles.statTrend} ${styles.neutral}`}>
                Based on {analyticsData.total_reports} reviews
              </p>
            </Card>
            <Card>
              <h3 className={styles.statTitle}>Ideas Submitted</h3>
              <p className={styles.statValue}>
                {analyticsData.participation_stats.ideas_submitted}
              </p>
              <p className={`${styles.statTrend} ${styles.neutral}`}>
                Across all themes
              </p>
            </Card>
            <Card>
              <h3 className={styles.statTitle}>Pending Reviews</h3>
              <p className={styles.statValue}>
                {analyticsData.participation_stats.reviews_completed}
              </p>
              <p className={`${styles.statTrend} ${styles.warning}`}>
                Reviews submitted
              </p>
            </Card>
          </>
        )}
      </section>

      <section className={styles.themesSection}>
        <header className={styles.sectionHeader}>
          <h2>Active Themes</h2>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            + Create New Theme
          </Button>
        </header>
        <ul className={styles.themesGrid}>
          {activeThemes.map((theme) => (
            <li key={theme.theme_id} className={styles.themeCard}>
              <header className={`${styles.themeHeader} ${styles.blue}`}>
                <h3>{theme.title}</h3>
              </header>
              <article className={styles.themeContent}>
                <p>{theme.description}</p>
                <footer className={styles.themeFooter}>
                  <span className={styles.themeStatus}>
                    {new Date(theme.voting_deadline) > new Date()
                      ? 'Voting'
                      : 'Review Phase'}
                  </span>
                  <Button onClick={() => handleManageTheme(theme)}>
                    Manage →
                  </Button>
                </footer>
              </article>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.gridContainer}>
        {analyticsData && (
          <Card title="Activity Overview">
            <article className={styles.activityGrid}>
              <section className={styles.activityBox}>
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
                    {analyticsData.participation_stats.reviews_completed}{' '}
                    reviews completed
                  </li>
                </ul>
              </section>
              <section className={styles.activityBox}>
                <h4>Upcoming Deadlines</h4>
                <ul>
                  {activeThemes.map((theme) => (
                    <li key={theme.theme_id}>
                      {theme.title}: Voting ends{' '}
                      {new Date(theme.voting_deadline).toLocaleDateString()}
                    </li>
                  ))}
                </ul>
              </section>
            </article>
          </Card>
        )}

        <aside className={styles.notificationsCard}>
          <h3>Recent Notifications</h3>
          {notifications.length > 0 ? (
            <ul className={styles.notificationsList}>
              {notifications.map((notification) => (
                <li key={notification.notification_id}>
                  <NotificationCard
                    message={notification.message}
                    created_at={notification.created_at}
                    status={notification.status}
                    notification_id={notification.notification_id}
                    recipient_role={notification.recipient_role}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.noData}>No new notifications</p>
          )}
        </aside>
      </section>

      <ThemeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTheme}
      />

      <ThemeModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedTheme(undefined);
        }}
        theme={selectedTheme}
        onSubmit={handleEditTheme}
      />
    </main>
  );
};

export default Dashboard;