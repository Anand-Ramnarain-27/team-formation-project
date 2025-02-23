import React, { useState } from 'react';
import styles from './Dashboard.module.css';
import { ThemeModal } from '@/app/admin/components/ThemeModals';
import {
  Theme,
  BaseTheme,
  AnalyticsReport,
  Notification,
} from '@/app/shared/utils/types';
import Card from '@/app/shared/components/Card/Card';
import Button from '@/app/shared/components/Button/Button';
import NotificationCard from '@/app/shared/components/NotificationCard/NotificationCard';

const initialThemes: Theme[] = [
  {
    theme_id: 1,
    title: 'Innovation in Education',
    description: 'Exploring new teaching methodologies',
    submission_deadline: '2025-03-01T00:00',
    voting_deadline: '2025-03-15T00:00',
    review_deadline: [{ start: '2025-03-16T00:00', end: '2025-03-30T00:00' }],
    number_of_groups: 10,
    auto_assign_group: true,
  },
  {
    theme_id: 2,
    title: 'Sustainable Development',
    description: 'Projects focusing on environmental sustainability',
    submission_deadline: '2025-04-01T00:00',
    voting_deadline: '2025-04-15T00:00',
    review_deadline: [{ start: '2025-04-16T00:00', end: '2025-04-30T00:00' }],
    number_of_groups: 8,
    auto_assign_group: false,
  },
];

const Dashboard: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<Theme | undefined>();
  const [activeThemes, setActiveThemes] = useState<Theme[]>(initialThemes);

  const [analyticsData] = useState<AnalyticsReport>({
    report_id: 1,
    theme_id: 1,
    total_students: 2543,
    total_reports: 156,
    average_rating: 4.2,
    participation_stats: {
      ideas_submitted: 45,
      votes_cast: 1200,
      reviews_completed: 450,
      totalIdeas: 0,
      totalVotes: 0,
      totalReviews: 0,
      averageRating: 0,
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

  const handleCreateTheme = (newTheme: BaseTheme) => {
    const theme: Theme = {
      ...newTheme,
      theme_id: Math.max(...activeThemes.map((t) => t.theme_id)) + 1,
    };
    setActiveThemes((prev: Theme[]) => [...prev, theme]);
  };

  const handleEditTheme = (updatedTheme: BaseTheme) => {
    if (!selectedTheme) return;
    const theme: Theme = {
      ...updatedTheme,
      theme_id: selectedTheme.theme_id,
    };
    setActiveThemes((prev: Theme[]) =>
      prev.map((t: Theme) =>
        t.theme_id === selectedTheme.theme_id ? theme : t
      )
    );
  };

  const handleManageTheme = (theme: Theme) => {
    setSelectedTheme(theme);
    setIsEditModalOpen(true);
  };

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1>Theme Management Dashboard</h1>
      </header>

      <section className={styles.statsGrid}>
        <Card>
          <h3 className={styles.statTitle}>Total Students</h3>
          <p className={styles.statValue}>{analyticsData.total_students}</p>
          <p className={`${styles.statTrend} ${styles.positive}`}>
            Active in current themes
          </p>
        </Card>
        <Card>
          <h3 className={styles.statTitle}>Average Rating</h3>
          <p className={styles.statValue}>{analyticsData.average_rating}/5.0</p>
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
                  {analyticsData.participation_stats.reviews_completed} reviews
                  completed
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

        <aside className={styles.notificationsCard}>
          <h3>Recent Notifications</h3>
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
