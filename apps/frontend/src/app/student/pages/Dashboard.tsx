import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css';
import ThemeModals from '../components/ThemeModals';
import { Theme, Idea, Group, Notification, User, IdeaSubmission } from '@/app/shared/utils/types';
import Card from '@/app/shared/components/Card/Card';
import StatusBadge from '@/app/shared/components/StatusBadge/StatusBadge';
import NotificationCard from '@/app/shared/components/NotificationCard/NotificationCard';
import GroupCard from '@/app/shared/components/GroupCard/GroupCard';
import IdeaCard from '@/app/shared/components/IdeaCard/IdeaCard';

const Dashboard: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [myIdeas, setMyIdeas] = useState<Idea[]>([]);
  const [myGroup, setMyGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const navigate = useNavigate();

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

  const isAdmin = currentUser?.role === 'Student';
  const userId = currentUser?.user_id;
  const userRole = currentUser?.role;

  const themeColors = [
    styles.pinkTheme,
    styles.greenTheme,
    styles.yellowTheme,
    styles.purpleTheme,
    styles.orangeTheme,
  ];

  const getRandomThemeColor = () =>
    themeColors[Math.floor(Math.random() * themeColors.length)];

  const fetchThemes = async () => {
    try {
      const response = await fetch('http://localhost:7071/api/theme');
      if (!response.ok) {
        throw new Error('Failed to fetch themes');
      }
      const data = await response.json();
      setThemes(data);
    } catch (err) {
      setError('Error fetching themes');
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

  const fetchMyIdeas = async () => {
    try {
      const response = await fetch(
        `http://localhost:7071/api/idea?submitted_by=${userId}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch my ideas');
      }
      const data = await response.json();
      setMyIdeas(data);
    } catch (err) {
      setError('Error fetching my ideas');
      console.error(err);
    }
  };

  const fetchMyGroup = async () => {
    try {
      const response = await fetch(
        `http://localhost:7071/api/group?user_id=${userId}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch my group');
      }
      const data = await response.json();
      setMyGroup(data[0] || null);
    } catch (err) {
      setError('Error fetching my group');
      console.error(err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchThemes(),
        fetchNotifications(),
        fetchMyIdeas(),
        fetchMyGroup(),
      ]);
      setIsLoading(false);
    };

    if (userId && userRole) {
      loadData();
    }
  }, [userId, userRole]);

  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [modalType, setModalType] = useState<'view' | 'submit' | null>(null);

  const getThemeStatus = (theme: Theme) => {
    const now = new Date();
    const submissionDeadline = new Date(theme.submission_deadline);
    const votingDeadline = new Date(theme.voting_deadline);
    const reviewDeadlines = theme.review_deadline; // Assuming this is an array of review deadlines
  
    // Check submission phase
    if (now < submissionDeadline) {
      return {
        phase: 'submission',
        actionButton: 'Submit Idea',
        isActive: true,
      };
    }
  
    // Check voting phase
    if (now < votingDeadline) {
      return { phase: 'voting', actionButton: 'Vote Now', isActive: true };
    }
  
    // Check review phases
    for (const reviewDeadline of reviewDeadlines) {
      const reviewStart = new Date(reviewDeadline.start);
      const reviewEnd = new Date(reviewDeadline.end);
  
      // If the current time is within a review phase
      if (now >= reviewStart && now <= reviewEnd) {
        return { phase: 'review', actionButton: 'Review', isActive: true };
      }
  
      // If the current time is before the start of a review phase
      if (now < reviewStart) {
        return {
          phase: 'review phase is going to start',
          actionButton: 'Review Phase Starting Soon',
          isActive: false,
        };
      }
    }
  
    // If all review phases are completed
    return { phase: 'completed', actionButton: 'Completed', isActive: false };
  };

  const handleThemeAction = (themeId: number, action: string) => {
    const theme = themes.find((t) => t.theme_id === themeId);
    if (!theme) return;
  
    const existingIdea = myIdeas.find(
      (idea) => idea.theme_id === theme.theme_id && idea.submitted_by === userId
    );
  
    if (existingIdea) {
      setError('You have already submitted an idea for this theme.');
      return;
    }
  
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

  const submitIdea = async (ideaSubmission: IdeaSubmission) => {
    if (!selectedTheme || !userId) {
      setError('Theme or user not found');
      return;
    }

    const existingIdea = myIdeas.find(
      (idea) => idea.theme_id === selectedTheme.theme_id && idea.submitted_by === userId
    );
  
    if (existingIdea) {
      setError('You have already submitted an idea for this theme.');
      return;
    }
  
    const newIdea = {
      theme_id: selectedTheme.theme_id,
      submitted_by: userId,
      idea_name: ideaSubmission.idea_name,
      description: ideaSubmission.description,
    };
  
    try {
      const response = await fetch('http://localhost:7071/api/idea', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newIdea),
      });
  
      if (!response.ok) {
        throw new Error('Failed to submit idea');
      }
  
      const data = await response.json();
      console.log('Idea submitted successfully:', data);
      setMyIdeas([...myIdeas, data]);
      setSelectedTheme(null);
      setModalType(null);
    } catch (err) {
      setError('Error submitting idea');
      console.error(err);
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
                <li key={idea.idea_id}>
                  <IdeaCard
                    key={idea.idea_id}
                    {...idea}
                    onVote={() => {}}
                    isVoted={false}
                    remainingVotes={0}
                    votingActive={false}
                  />
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
          onIdeaSubmit={submitIdea}
        />
      )}
    </main>
  );
};

export default Dashboard;