import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css';
import ThemeModals from '../components/ThemeModals';
import { Theme, Idea, Group, Notification } from '@/app/shared/utils/types';
import Card from '@/app/shared/components/Card/Card';
import StatusBadge from '@/app/shared/components/StatusBadge/StatusBadge';
import NotificationCard from '@/app/shared/components/NotificationCard/NotificationCard';
import GroupCard from '@/app/shared/components/GroupCard/GroupCard';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const themeColors = [
    styles.pinkTheme,
    styles.greenTheme,
    styles.yellowTheme,
    styles.purpleTheme,
    styles.orangeTheme,
  ];

  const getRandomThemeColor = () =>
    themeColors[Math.floor(Math.random() * themeColors.length)];

  const [themes] = useState<Theme[]>([
    {
      theme_id: 1,
      title: 'Innovation in EdTech',
      description: 'Exploring new technologies in education',
      submission_deadline: '2025-03-01T00:00:00Z',
      voting_deadline: '2025-03-15T00:00:00Z',
      review_deadline: [
        { start: '2025-03-16T00:00:00Z', end: '2025-03-30T00:00:00Z' },
      ],
      number_of_groups: 4,
      auto_assign_group: true,
    },
  ]);

  const [notifications] = useState<Notification[]>([
    {
      notification_id: 1,
      recipient_role: 'student',
      message: 'New theme available for idea submission',
      created_at: '2025-02-17T10:00:00Z',
    },
  ]);

  const [myIdeas] = useState<Idea[]>([
    {
      idea_id: 1,
      theme_id: 1,
      submitted_by: 1,
      idea_name: 'AI-Powered Study Assistant',
      description: 'An AI tool to help students organize their study materials',
      status: 'Pending',
      created_at: '2025-02-16T15:30:00Z',
    },
  ]);

  const [myGroup] = useState<Group | null>({
    group_id: 1,
    theme_id: 1,
    group_name: 'Innovation Team Alpha',
    team_lead: 123,
    created_at: '2025-02-16T15:30:00Z',
    updated_at: null,
  });

  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [modalType, setModalType] = useState<'view' | 'submit' | null>(null);

  const getThemeStatus = (theme: Theme) => {
    const now = new Date();
    const submissionDeadline = new Date(theme.submission_deadline);
    const votingDeadline = new Date(theme.voting_deadline);
    const reviewDeadline = theme.review_deadline[0];
    const reviewStart = reviewDeadline ? new Date(reviewDeadline.start) : null;
    const reviewEnd = reviewDeadline ? new Date(reviewDeadline.end) : null;

    if (now < submissionDeadline) {
      return {
        phase: 'submission',
        actionButton: 'Submit Idea',
        isActive: true,
      };
    } else if (now < votingDeadline) {
      return { phase: 'voting', actionButton: 'Vote Now', isActive: true };
    } else if (
      reviewStart &&
      reviewEnd &&
      now >= reviewStart &&
      now <= reviewEnd
    ) {
      return { phase: 'review', actionButton: 'Review', isActive: true };
    }
    return { phase: 'completed', actionButton: 'Completed', isActive: false };
  };

  const handleThemeAction = (themeId: number, action: string) => {
    const theme = themes.find((t) => t.theme_id === themeId);
    if (!theme) return;

    switch (action) {
      case 'Submit Idea':
        setSelectedTheme(theme);
        setModalType('submit');
        break;
      case 'Vote Now':
        navigate('/student/vote');
        break;
      case 'Review':
        navigate('/student/review');
        break;
    }
  };

  const handleViewTheme = (themeId: number) => {
    const theme = themes.find((t) => t.theme_id === themeId);
    if (theme) {
      setSelectedTheme(theme);
      setModalType('view');
    }
  };

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1>Active Themes</h1>
        <time className={styles.dateNav} dateTime={new Date().toISOString()}>
          {new Date().toLocaleDateString()}
        </time>
      </header>

      <section className={styles.topSection}>
        <section className={styles.themesGrid}>
          {themes.map((theme) => {
            const status = getThemeStatus(theme);
            const themeColor = getRandomThemeColor();
            return (
              <Card
                title={theme.title}
                key={theme.theme_id}
                className={`${styles.themeCard} ${themeColor}`}
              >
                <p className={styles.themeInfo}>{theme.description}</p>
                <footer className={styles.themeFooter}>
                  <div className={styles.themeButtons}>
                    <button
                      className={styles.viewButton}
                      onClick={() => handleViewTheme(theme.theme_id)}
                    >
                      View Theme
                    </button>
                    <button
                      className={styles.viewButton}
                      onClick={() =>
                        status.isActive &&
                        handleThemeAction(theme.theme_id, status.actionButton)
                      }
                      disabled={!status.isActive}
                    >
                      {status.actionButton}
                    </button>
                  </div>
                  <span className={styles.status}>Phase: {status.phase}</span>
                </footer>
              </Card>
            );
          })}
        </section>

        <aside>
          <Card title="Notifications">
            <ul className={styles.notificationsContent}>
              {notifications.map((notification) => (
                <li key={notification.notification_id}>
                  <NotificationCard {...notification} />
                </li>
              ))}
            </ul>
          </Card>
        </aside>
      </section>

      <section className={styles.bottomSection}>
        <article>
          <Card title="My Ideas">
            <header className={styles.cardHeader} />
            <ul className={styles.scrollArea}>
              {myIdeas.map((idea) => (
                <li key={idea.idea_id} className={styles.notification}>
                  <article className={styles.notificationContent}>
                    <h4 className={styles.notificationTitle}>
                      {idea.idea_name}
                    </h4>
                    <p className={styles.notificationDescription}>
                      {idea.description}
                    </p>
                    <StatusBadge
                      status={idea.status.toLowerCase()}
                      label={idea.status}
                    />
                  </article>
                </li>
              ))}
            </ul>
          </Card>
        </article>

        <article>
          <Card title="My Group">
            <header className={styles.cardHeader} />
            {myGroup ? (
              <GroupCard
                group={myGroup}
                showActions={false}
                className={styles.dashboardGroupCard}
              />
            ) : (
              <p>You haven't been assigned to a group yet.</p>
            )}
          </Card>
        </article>
      </section>

      {selectedTheme && modalType && (
        <ThemeModals
          theme={selectedTheme}
          isOpen={!!modalType}
          onClose={() => {
            setSelectedTheme(null);
            setModalType(null);
          }}
          modalType={modalType}
        />
      )}
    </main>
  );
};

export default Dashboard;
