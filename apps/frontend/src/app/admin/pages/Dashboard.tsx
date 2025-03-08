import React, { useState, useEffect } from 'react';
import styles from './Dashboard.module.css';
import { ThemeModal } from '@/app/admin/components/ThemeModals';
import {
  Theme,
  BaseTheme,
  AnalyticsReport,
  Notification,
  User,
  Question,
  BaseThemeWithQuestions,
  ThemeWithQuestions,
} from '@/app/shared/utils/types';
import Card from '@/app/shared/components/Card/Card';
import Button from '@/app/shared/components/Button/Button';
import NotificationCard from '@/app/shared/components/NotificationCard/NotificationCard';

const Dashboard: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<
    ThemeWithQuestions | undefined
  >();
  const [activeThemes, setActiveThemes] = useState<ThemeWithQuestions[]>([]);
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

  // Dummy theme data with questions
  const dummyThemes: ThemeWithQuestions[] = [
    {
      theme_id: 1,
      title: 'Sustainable Innovation',
      description:
        'Develop ideas for sustainable innovation in campus operations.',
      submission_deadline: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ).toISOString(), // 7 days from now
      voting_deadline: new Date(
        Date.now() + 14 * 24 * 60 * 60 * 1000
      ).toISOString(), // 14 days from now
      review_deadline: [
        {
          start: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now
          end: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days from now
        },
      ],
      number_of_groups: 4,
      auto_assign_group: true,
      created_by: 1,
      questions: [
        {
          question_id: 1,
          theme_id: 1,
          question_text:
            'How well did this team member contribute to group discussions?',
        },
        {
          question_id: 2,
          theme_id: 1,
          question_text:
            "How would you rate this team member's problem-solving skills?",
        },
      ],
    },
    {
      theme_id: 2,
      title: 'Digital Learning',
      description:
        'Explore innovative approaches to enhance digital learning experiences.',
      submission_deadline: new Date(
        Date.now() - 3 * 24 * 60 * 60 * 1000
      ).toISOString(), // 3 days ago
      voting_deadline: new Date(
        Date.now() + 4 * 24 * 60 * 60 * 1000
      ).toISOString(), // 4 days from now
      review_deadline: [
        {
          start: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
          end: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
        },
      ],
      number_of_groups: 3,
      auto_assign_group: false,
      created_by: 2,
      questions: [
        {
          question_id: 3,
          theme_id: 2,
          question_text:
            'How effectively did this team member communicate their ideas?',
        },
        {
          question_id: 4,
          theme_id: 2,
          question_text:
            "How would you rate this team member's ability to meet deadlines?",
        },
        {
          question_id: 5,
          theme_id: 2,
          question_text:
            'Did this team member actively participate in the project development?',
        },
      ],
    },
    {
      theme_id: 3,
      title: 'Student Wellness',
      description:
        'Generate ideas to improve student mental health and wellness on campus.',
      submission_deadline: new Date(
        Date.now() - 10 * 24 * 60 * 60 * 1000
      ).toISOString(), // 10 days ago
      voting_deadline: new Date(
        Date.now() - 3 * 24 * 60 * 60 * 1000
      ).toISOString(), // 3 days ago
      review_deadline: [
        {
          start: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
          end: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
        },
      ],
      number_of_groups: 5,
      auto_assign_group: true,
      created_by: 1,
      questions: [
        {
          question_id: 6,
          theme_id: 3,
          question_text:
            'How well did this team member collaborate with others?',
        },
      ],
    },
  ];

  // Fetch themes data (now using dummy data)
  const fetchThemes = async () => {
    // Simulate API fetch delay
    setTimeout(() => {
      setActiveThemes(dummyThemes);
    }, 500);
  };

  // Fetch analytics data
  const fetchAnalytics = async () => {
    // Dummy analytics data
    const dummyAnalytics: AnalyticsReport = {
      report_id: 1,
      theme_id: 1,
      total_students: 87,
      total_reports: 32,
      average_rating: 4.2,
      participation_stats: {
        ideas_submitted: 45,
        votes_cast: 156,
        reviews_completed: 28,
        totalIdeas: 45,
        totalVotes: 200,
        totalReviews: 35,
        averageRating: 4.2,
      },
    };

    // Simulate API fetch delay
    setTimeout(() => {
      setAnalyticsData(dummyAnalytics);
    }, 700);
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      // In a real app, uncomment this to fetch from the API
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

    if (userId && userRole) {
      loadData();
    }
  }, [userId, userRole]);

  // Create a new theme with questions
  const handleCreateTheme = async (newTheme: BaseThemeWithQuestions) => {
    try {
      const themeWithCreator = {
        ...newTheme,
        created_by: userId,
      };

      // Create a new theme with a dummy ID
      const newId =
        activeThemes.length > 0
          ? Math.max(...activeThemes.map((t) => t.theme_id)) + 1
          : 1;

      // Generate question IDs
      const questionsWithIds = newTheme.questions.map((q, index) => ({
        ...q,
        question_id:
          Math.max(
            ...activeThemes.flatMap((t) =>
              t.questions.map((q) => q.question_id || 0)
            )
          ) +
          index +
          1,
        theme_id: newId,
      }));

      const createdTheme: ThemeWithQuestions = {
        ...themeWithCreator,
        theme_id: newId,
        questions: questionsWithIds,
      };

      setActiveThemes((prev) => [...prev, createdTheme]);

      // Add a notification for the new theme
      const newNotification: Notification = {
        notification_id:
          notifications.length > 0
            ? Math.max(...notifications.map((n) => n.notification_id)) + 1
            : 1,
        recipient_role: 'Admin',
        message: `New theme "${newTheme.title}" has been created`,
        created_at: new Date().toISOString(),
        created_by: userId || 1,
        status: 'success',
      };

      setNotifications((prev) => [newNotification, ...prev]);
    } catch (err) {
      setError('Error creating theme');
      console.error(err);
    }
  };

  // Edit an existing theme with questions
  const handleEditTheme = async (updatedTheme: BaseThemeWithQuestions) => {
    if (!selectedTheme) return;

    try {
      const themeWithCreator = {
        ...updatedTheme,
        created_by: selectedTheme.created_by,
      };

      // Update questions with IDs
      const existingQuestionIds = selectedTheme.questions.map(
        (q) => q.question_id
      );
      const maxQuestionId = Math.max(
        ...activeThemes.flatMap((t) =>
          t.questions.map((q) => q.question_id || 0)
        ),
        0
      );

      const updatedQuestions = updatedTheme.questions.map((q, index) => {
        if (index < existingQuestionIds.length && existingQuestionIds[index]) {
          // Reuse existing question ID
          return {
            ...q,
            question_id: existingQuestionIds[index],
            theme_id: selectedTheme.theme_id,
          };
        } else {
          // Generate new ID for new questions
          return {
            ...q,
            question_id: maxQuestionId + index + 1,
            theme_id: selectedTheme.theme_id,
          };
        }
      });

      // Update the theme in the local state
      const updatedThemeData: ThemeWithQuestions = {
        ...themeWithCreator,
        theme_id: selectedTheme.theme_id,
        questions: updatedQuestions,
      };

      setActiveThemes((prev) =>
        prev.map((t) =>
          t.theme_id === selectedTheme.theme_id ? updatedThemeData : t
        )
      );

      // Add a notification for the updated theme
      const newNotification: Notification = {
        notification_id:
          notifications.length > 0
            ? Math.max(...notifications.map((n) => n.notification_id)) + 1
            : 1,
        recipient_role: 'Admin',
        message: `Theme "${updatedTheme.title}" has been updated`,
        created_at: new Date().toISOString(),
        created_by: userId || 1,
        status: 'info',
      };

      setNotifications((prev) => [newNotification, ...prev]);
    } catch (err) {
      setError('Error updating theme');
      console.error(err);
    }
  };

  const handleManageTheme = (theme: ThemeWithQuestions) => {
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
                <p className={styles.questionCount}>
                  {theme.questions.length} review question
                  {theme.questions.length !== 1 ? 's' : ''}
                </p>
                <footer className={styles.themeFooter}>
                  <span className={styles.themeStatus}>
                    {(() => {
                      const now = new Date();

                      // Check if we're in the submission phase
                      if (now < new Date(theme.submission_deadline)) {
                        return 'Submission Phase';
                      }

                      // Check if we're in the voting phase
                      if (now < new Date(theme.voting_deadline)) {
                        return 'Voting Phase';
                      }

                      // Check if we're in any of the review phases
                      for (const review of theme.review_deadline) {
                        if (
                          now >= new Date(review.start) &&
                          now <= new Date(review.end)
                        ) {
                          return `Review Phase (Group ${
                            theme.review_deadline.indexOf(review) + 1
                          })`;
                        }
                      }

                      // Check if the review phase hasn't started yet but there is one scheduled
                      const nextReview = theme.review_deadline.find(
                        (review) => now < new Date(review.start)
                      );
                      if (nextReview) {
                        return 'Review Phase is Going to Start';
                      }

                      // If none of the above, it's completed
                      return 'Completed';
                    })()}
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
                  {activeThemes
                    .map((theme) => {
                      const nextDeadline = (() => {
                        const now = new Date();
                        if (now < new Date(theme.submission_deadline)) {
                          return {
                            type: 'Submission',
                            date: new Date(theme.submission_deadline),
                          };
                        }
                        if (now < new Date(theme.voting_deadline)) {
                          return {
                            type: 'Voting',
                            date: new Date(theme.voting_deadline),
                          };
                        }
                        const upcomingReview = theme.review_deadline.find(
                          (review) => now < new Date(review.start)
                        );
                        if (upcomingReview) {
                          return {
                            type: 'Review starts',
                            date: new Date(upcomingReview.start),
                          };
                        }
                        const activeReview = theme.review_deadline.find(
                          (review) =>
                            now >= new Date(review.start) &&
                            now <= new Date(review.end)
                        );
                        if (activeReview) {
                          return {
                            type: 'Review ends',
                            date: new Date(activeReview.end),
                          };
                        }
                        return null;
                      })();

                      if (!nextDeadline) return null;

                      return (
                        <li key={theme.theme_id}>
                          {theme.title}: {nextDeadline.type}{' '}
                          {nextDeadline.date.toLocaleDateString()}
                        </li>
                      );
                    })
                    .filter(Boolean)}
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
