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

  // Fetch themes data from the API
  const fetchThemes = async () => {
    try {
      // Fetch all themes
      const themesResponse = await fetch('http://localhost:7071/api/theme');
      if (!themesResponse.ok) {
        throw new Error('Failed to fetch themes');
      }
      const themesData = await themesResponse.json();
      
      // Process each theme to include its questions
      const themesWithQuestions = await Promise.all(
        themesData.map(async (theme: Theme) => {
          // Fetch questions for this theme
          const questionsResponse = await fetch(`http://localhost:7071/api/question?id=${theme.theme_id}`);
          if (!questionsResponse.ok) {
            throw new Error(`Failed to fetch questions for theme ${theme.theme_id}`);
          }
          const questions = await questionsResponse.json();
          
          // Ensure review_deadline is properly parsed
          const parsedReviewDeadline = Array.isArray(theme.review_deadline) 
            ? theme.review_deadline 
            : (typeof theme.review_deadline === 'string' 
              ? JSON.parse(theme.review_deadline) 
              : []);
          
          return {
            ...theme,
            review_deadline: parsedReviewDeadline,
            questions: questions || []
          };
        })
      );
      
      setActiveThemes(themesWithQuestions);
    } catch (err) {
      setError('Error fetching themes');
      console.error(err);
    }
  };

  // Fetch analytics data from API
  const fetchAnalytics = async () => {
    try {
      const response = await fetch('http://localhost:7071/api/generateAllThemesAnalytics');
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
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

      // Create theme via API
      const themeResponse = await fetch('http://localhost:7071/api/theme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(themeWithCreator),
      });

      if (!themeResponse.ok) {
        throw new Error('Failed to create theme');
      }

      const createdTheme = await themeResponse.json();

      // Create questions for the theme
      await Promise.all(
        newTheme.questions.map(async (question) => {
          const questionData = {
            theme_id: createdTheme.theme_id,
            question_text: question.question_text,
          };

          const questionResponse = await fetch('http://localhost:7071/api/question', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(questionData),
          });

          if (!questionResponse.ok) {
            throw new Error('Failed to create question');
          }
        })
      );

      // Refresh themes after creation
      await fetchThemes();
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

      // Update theme via API
      const themeResponse = await fetch(`http://localhost:7071/api/theme?id=${selectedTheme.theme_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(themeWithCreator),
      });

      if (!themeResponse.ok) {
        throw new Error('Failed to update theme');
      }

      // Get existing questions for comparison
      const existingQuestionIds = selectedTheme.questions.map(q => q.question_id);
      
      // Process each question - update existing, create new ones
      await Promise.all(
        updatedTheme.questions.map(async (question, index) => {
          if (index < existingQuestionIds.length && existingQuestionIds[index]) {
            // Update existing question
            const questionData = {
              id: existingQuestionIds[index],
              theme_id: selectedTheme.theme_id,
              question_text: question.question_text,
            };

            await fetch('http://localhost:7071/api/question', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(questionData),
            });
          } else {
            // Create new question
            const questionData = {
              theme_id: selectedTheme.theme_id,
              question_text: question.question_text,
            };

            await fetch('http://localhost:7071/api/question', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(questionData),
            });
          }
        })
      );

      // Handle deleted questions
      if (existingQuestionIds.length > updatedTheme.questions.length) {
        // Delete questions that were removed
        for (let i = updatedTheme.questions.length; i < existingQuestionIds.length; i++) {
          if (existingQuestionIds[i]) {
            await fetch('http://localhost:7071/api/question', {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ id: existingQuestionIds[i] }),
            });
          }
        }
      }

      // Refresh themes after update
      await fetchThemes();
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
              <h3 className={styles.statTitle}>Ideas Submitted</h3>
              <p className={styles.statValue}>
                {analyticsData.participation_stats.ideas_submitted}
              </p>
              <p className={`${styles.statTrend} ${styles.neutral}`}>
                Across all themes
              </p>
            </Card>
            <Card>
              <h3 className={styles.statTitle}>Reviews</h3>
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
                    {analyticsData.participation_stats.totalVotes} votes cast
                  </li>
                  <li>
                    {analyticsData.participation_stats.totalIdeas} ideas
                    submitted
                  </li>
                  <li>
                    {analyticsData.participation_stats.totalReviews}{' '}
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