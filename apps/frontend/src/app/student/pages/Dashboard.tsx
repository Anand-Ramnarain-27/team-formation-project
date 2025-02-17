import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css';

interface Theme {
  theme_id: number;
  title: string;
  description: string;
  submission_deadline: string;
  voting_deadline: string;
  review_deadline: {
    start: string;
    end: string;
  };
  number_of_groups: number;
  color_index: number; 
}

interface Idea {
  idea_id: number;
  theme_id: number;
  idea_name: string;
  description: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  created_at: string;
}

interface Group {
  group_id: number;
  theme_id: number;
  group_name: string;
  team_lead: number;
}

interface Notification {
  notification_id: number;
  recipient_role: string;
  message: string;
  created_at: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  // Theme colors array
  const themeColors = [
    styles.blueTheme,
    styles.pinkTheme,
    styles.greenTheme,
    styles.yellowTheme,
    'bg-purple-500',
    'bg-orange-500',
    'bg-teal-500',
    'bg-indigo-500',
  ];

  const [themes] = useState<Theme[]>([
    {
      theme_id: 1,
      title: 'Innovation in EdTech',
      description: 'Exploring new technologies in education',
      submission_deadline: '2025-03-01T00:00:00Z',
      voting_deadline: '2025-03-15T00:00:00Z',
      review_deadline: {
        start: '2025-03-16T00:00:00Z',
        end: '2025-03-30T00:00:00Z',
      },
      number_of_groups: 4,
      color_index: 0,
    },
    {
      theme_id: 2,
      title: 'Innovation in EdTech',
      description: 'Exploring new technologies in education',
      submission_deadline: '2025-02-01T00:00:00Z',
      voting_deadline: '2025-02-20T00:00:00Z',
      review_deadline: {
        start: '2025-03-16T00:00:00Z',
        end: '2025-03-30T00:00:00Z',
      },
      number_of_groups: 4,
      color_index: 1,
    },
  ]);

  const [notifications] = useState<Notification[]>([
    {
      notification_id: 1,
      recipient_role: 'student',
      message: 'New theme available for idea submission',
      created_at: '2025-02-17T10:00:00Z',
    },
    // ... more notifications
  ]);

  const getThemeStatus = (theme: Theme) => {
    const now = new Date();
    const submissionDeadline = new Date(theme.submission_deadline);
    const votingDeadline = new Date(theme.voting_deadline);
    const reviewStart = new Date(theme.review_deadline.start);
    const reviewEnd = new Date(theme.review_deadline.end);

    if (now < submissionDeadline) {
      return {
        phase: 'submission',
        actionButton: 'Submit Idea',
        isActive: true,
      };
    } else if (now < votingDeadline) {
      return {
        phase: 'voting',
        actionButton: 'Vote Now',
        isActive: true,
      };
    } else if (now >= reviewStart && now <= reviewEnd) {
      return {
        phase: 'review',
        actionButton: 'Review',
        isActive: true,
      };
    } else {
      return {
        phase: 'completed',
        actionButton: 'Completed',
        isActive: false,
      };
    }
  };

  const [myIdeas] = useState<Idea[]>([
    {
      idea_id: 1,
      theme_id: 1,
      idea_name: 'AI-Powered Study Assistant',
      description: 'An AI tool to help students organize their study materials',
      status: 'Pending',
      created_at: '2025-02-16T15:30:00Z',
    },
    // ... more ideas
  ]);

  const [myGroup] = useState<Group | null>({
    group_id: 1,
    theme_id: 1,
    group_name: 'Innovation Team Alpha',
    team_lead: 123,
  });

  const getStatusColor = (deadline: string): string => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    if (deadlineDate < now) return styles.greenTheme;
    if (deadlineDate.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000)
      return styles.yellowTheme;
    return styles.blueTheme;
  };

  const handleThemeAction = (themeId: number, action: string) => {
    switch (action) {
      case 'Submit Idea':
        // Handle idea submission
        console.log('Submit idea for theme:', themeId);
        break;
      case 'Vote Now':
        navigate('/student/vote');
        break;
      case 'Review':
        navigate('/student/review');
        break;
      default:
        break;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Active Themes</h1>
        <div className={styles.dateNav}>
          <span>{new Date().toLocaleDateString()}</span>
        </div>
      </div>

      <div className={styles.topSection}>
        <div className={styles.themesGrid}>
          {themes.map((theme) => {
            const status = getThemeStatus(theme);
            return (
              <div 
                key={theme.theme_id} 
                className={`${styles.themeCard} ${themeColors[theme.color_index % themeColors.length]}`}
              >
                <h3 className={styles.themeTitle}>{theme.title}</h3>
                <p className={styles.themeInfo}>{theme.description}</p>
                <div className={styles.themeFooter}>
                  <div className={styles.themeButtons}>
                    <button 
                      className={styles.viewButton}
                      onClick={() => console.log('View theme:', theme.theme_id)}
                    >
                      View Theme
                    </button>
                    <button 
                      className={`${styles.viewButton} ${!status.isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => status.isActive && handleThemeAction(theme.theme_id, status.actionButton)}
                      disabled={!status.isActive}
                    >
                      {status.actionButton}
                    </button>
                  </div>
                  <span className={styles.status}>
                    Phase: {status.phase}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className={styles.notificationsCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Notifications</h2>
          </div>
          <div className={styles.notificationsContent}>
            {notifications.map((notification) => (
              <div
                key={notification.notification_id}
                className={styles.notification}
              >
                <div className={styles.notificationContent}>
                  <p className={styles.notificationDescription}>
                    {notification.message}
                  </p>
                  <small>
                    {new Date(notification.created_at).toLocaleString()}
                  </small>
                </div>
                <button className={styles.closeButton}>×</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.bottomSection}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>My Ideas</h2>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.scrollArea}>
              {myIdeas.map((idea) => (
                <div key={idea.idea_id} className={styles.notification}>
                  <div className={styles.notificationContent}>
                    <h4 className={styles.notificationTitle}>
                      {idea.idea_name}
                    </h4>
                    <p className={styles.notificationDescription}>
                      {idea.description}
                    </p>
                    <span
                      className={`${styles.status} ${
                        idea.status === 'Approved'
                          ? styles.greenTheme
                          : idea.status === 'Rejected'
                          ? 'text-red-500'
                          : styles.yellowTheme
                      }`}
                    >
                      {idea.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>My Group</h2>
          </div>
          <div className={styles.cardContent}>
            {myGroup ? (
              <>
                <h3 className={styles.themeTitle}>{myGroup.group_name}</h3>
                <p className={styles.cardDescription}>
                  Theme ID: {myGroup.theme_id}
                </p>
                <div className={styles.scrollArea}>
                  {/* Group members would be fetched and displayed here */}
                </div>
              </>
            ) : (
              <p>You haven't been assigned to a group yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
