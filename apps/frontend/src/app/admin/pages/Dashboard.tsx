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
import Tabs from '@/app/shared/components/Tabs/Tabs';

const Dashboard: React.FC = () => {
  const [activeTabId, setActiveTabId] = useState('active-themes');
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<
    ThemeWithQuestions | undefined
  >();
  const [activeThemes, setActiveThemes] = useState<ThemeWithQuestions[]>([]);
  const [previousThemes, setPreviousThemes] = useState<ThemeWithQuestions[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsReport | null>(
    null
  );
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

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

  const fetchThemes = async () => {
    try {
      const themesResponse = await fetch('http://localhost:7071/api/theme');
      if (!themesResponse.ok) {
        throw new Error('Failed to fetch themes');
      }
      const themesData = await themesResponse.json();

      const themesWithQuestions = await Promise.all(
        themesData.map(async (theme: Theme) => {
          const questionsResponse = await fetch(`http://localhost:7071/api/question?id=${theme.theme_id}`);
          if (!questionsResponse.ok) {
            throw new Error(`Failed to fetch questions for theme ${theme.theme_id}`);
          }
          const questions = await questionsResponse.json();

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

      const now = new Date();
      const active: ThemeWithQuestions[] = [];
      const previous: ThemeWithQuestions[] = [];
      
      themesWithQuestions.forEach(theme => {
        let isCompleted = true;

        if (theme.review_deadline && theme.review_deadline.length > 0) {
          const lastReviewDeadline = theme.review_deadline[theme.review_deadline.length - 1];
          if (now <= new Date(lastReviewDeadline.end)) {
            isCompleted = false;
          }
        } else if (now <= new Date(theme.voting_deadline)) {
          isCompleted = false;
        }
        
        if (isCompleted) {
          previous.push(theme);
        } else {
          active.push(theme);
        }
      });
      
      setActiveThemes(active);
      setPreviousThemes(previous);
    } catch (err) {
      setError('Error fetching themes');
      console.error(err);
    }
  };

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

  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];
  
    activeThemes.forEach((theme) => {
      const votingDeadline = new Date(theme.voting_deadline);
      const now = new Date();
      const timeRemaining = votingDeadline.getTime() - now.getTime();
  
      if (timeRemaining > 0) {
        const timeout = setTimeout(async () => {
          try {
            const response = await fetch('http://localhost:7071/api/autoAssign', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ theme_id: theme.theme_id }),
            });
  
            if (response.ok) {
              console.log(`Auto-assign triggered for theme: ${theme.title}`);
            } else {
              console.error(`Failed to trigger auto-assign for theme: ${theme.title}`);
            }
  
            await fetchThemes();
          } catch (error) {
            console.error(`Error triggering auto-assign for theme: ${theme.title}`, error);
          }
        }, timeRemaining);
  
        timeouts.push(timeout);
      }
    });
  
    return () => timeouts.forEach((timeout) => clearTimeout(timeout));
  }, [activeThemes]);

  const handleCreateTheme = async (newTheme: BaseThemeWithQuestions) => {
    try {
      const themeWithCreator = {
        ...newTheme,
        created_by: userId,
      };

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

      await fetchThemes();
    } catch (err) {
      setError('Error creating theme');
      console.error(err);
    }
  };

  const handleEditTheme = async (updatedTheme: BaseThemeWithQuestions) => {
    if (!selectedTheme) return;

    try {
      const themeWithCreator = {
        ...updatedTheme,
        created_by: selectedTheme.created_by,
      };

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

      const existingQuestionIds = selectedTheme.questions.map(q => q.question_id);

      await Promise.all(
        updatedTheme.questions.map(async (question, index) => {
          if (index < existingQuestionIds.length && existingQuestionIds[index]) {
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

      if (existingQuestionIds.length > updatedTheme.questions.length) {
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

  const getThemeStatus = (theme: ThemeWithQuestions) => {
    const now = new Date();

    if (now < new Date(theme.submission_deadline)) {
      return 'Submission Phase';
    }

    if (now < new Date(theme.voting_deadline)) {
      return 'Voting Phase';
    }

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

    const nextReview = theme.review_deadline.find(
      (review) => now < new Date(review.start)
    );
    if (nextReview) {
      return 'Review Phase is Going to Start';
    }

    return 'Completed';
  };

  const renderThemesList = (themes: ThemeWithQuestions[]) => {
    return (
      <ul className={styles.themesGrid}>
        {themes.length > 0 ? (
          themes.map((theme) => (
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
                    {getThemeStatus(theme)}
                  </span>
                  <Button onClick={() => handleManageTheme(theme)}>
                    Manage →
                  </Button>
                </footer>
              </article>
            </li>
          ))
        ) : (
          <li className={styles.noData}>No themes available</li>
        )}
      </ul>
    );
  };

  if (isLoading) {
    return <div className={styles.loading}>Loading dashboard data...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  const themeTabs = [
    { id: 'active-themes', label: 'Active Themes' },
    { id: 'previous-themes', label: 'Previous Themes' }
  ];

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1>Theme Management Dashboard</h1>
      </header>

      <section className={styles.statsGrid}>
        {analyticsData && (
          <>
            <Card>
              <h3 className={styles.statTitle}>Total Users</h3>
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
          <h2>Themes</h2>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            + Create New Theme
          </Button>
        </header>
        
        <Tabs 
          tabs={themeTabs} 
          activeTab={activeTabId} 
          onTabChange={setActiveTabId} 
        />
        
        <div role="tabpanel" id={`panel-active-themes`} aria-labelledby={`tab-active-themes`} hidden={activeTabId !== 'active-themes'}>
          {renderThemesList(activeThemes)}
        </div>
        
        <div role="tabpanel" id={`panel-previous-themes`} aria-labelledby={`tab-previous-themes`} hidden={activeTabId !== 'previous-themes'}>
          {renderThemesList(previousThemes)}
        </div>
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