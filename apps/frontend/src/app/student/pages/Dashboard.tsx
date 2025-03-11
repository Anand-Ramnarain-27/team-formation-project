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
import Tabs from '@/app/shared/components/Tabs/Tabs';
import useApi from '@/app/shared/hooks/useApi';

const Dashboard: React.FC = () => {
  const { get, post, patch, remove, loading, error } = useApi('');
  const [activeTabId, setActiveTabId] = useState<string>('active-themes');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [previousThemes, setPreviousThemes] = useState<Theme[]>([]);
  const [myIdeas, setMyIdeas] = useState<Idea[]>([]);
  const [myGroup, setMyGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const navigate = useNavigate();

  const tabs = [
    { id: 'active-themes', label: 'Active Themes' },
    { id: 'previous-themes', label: 'Previous Themes' },
  ];

  useEffect(() => {
    const userJson = localStorage.getItem('currentUser');

    if (!userJson) {
      return;
    }

    try {
      const user = JSON.parse(userJson) as User;
      setCurrentUser(user);
    } catch (err) {
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
      const data = await get('/theme');
      
      const active: Theme[] = [];
      const previous: Theme[] = [];
      
      data.forEach((theme: Theme) => {
        const status = getThemeStatus(theme);
        if (status.phase === 'completed') {
          previous.push(theme);
        } else {
          active.push(theme);
        }
      });
      
      setThemes(active);
      setPreviousThemes(previous);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const data = await get(`/notification?user_id=${userId}&user_role=${userRole}`);
      setNotifications(data);
    } catch (err) {;
      console.error(err);
    }
  };

  const fetchMyIdeas = async () => {
    try {
      const data = await get(`/idea?submitted_by=${userId}`);
      setMyIdeas(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMyGroup = async () => {
    try {
      const data = await get(`/group?user_id=${userId}`);
      setMyGroup(data[0] || null);
    } catch (err) {
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
    const reviewDeadlines = theme.review_deadline; 
  
    if (now < submissionDeadline) {
      return {
        phase: 'submission',
        actionButton: 'Submit Idea',
        isActive: true,
      };
    }

    if (now < votingDeadline) {
      return { phase: 'voting', actionButton: 'Vote Now', isActive: true };
    }
  
    for (const reviewDeadline of reviewDeadlines) {
      const reviewStart = new Date(reviewDeadline.start);
      const reviewEnd = new Date(reviewDeadline.end);

      if (now >= reviewStart && now <= reviewEnd) {
        return { phase: 'review', actionButton: 'Review', isActive: true };
      }

      if (now < reviewStart) {
        return {
          phase: 'review phase is going to start',
          actionButton: 'Review Phase Starting Soon',
          isActive: false,
        };
      }
    }

    return { phase: 'completed', actionButton: 'Completed', isActive: false };
  };

  const handleThemeAction = (themeId: number, action: string) => {
    const theme = themes.find((t) => t.theme_id === themeId);
    if (!theme) return;
  
    const existingIdea = myIdeas.find(
      (idea) => idea.theme_id === theme.theme_id && idea.submitted_by === userId
    );
  
    if (existingIdea) {
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

  const handleViewTheme = (themeId: number, isFromPrevious: boolean = false) => {
    const themeList = isFromPrevious ? previousThemes : themes;
    const theme = themeList.find((t) => t.theme_id === themeId);
    if (theme) {
      setSelectedTheme(theme);
      setModalType('view');
    }
  };

  const submitIdea = async (ideaSubmission: IdeaSubmission) => {
    if (!selectedTheme || !userId) {
      return;
    }

    const existingIdea = myIdeas.find(
      (idea) => idea.theme_id === selectedTheme.theme_id && idea.submitted_by === userId
    );
  
    if (existingIdea) {
      return;
    }
  
    const newIdea = {
      theme_id: selectedTheme.theme_id,
      submitted_by: userId,
      idea_name: ideaSubmission.idea_name,
      description: ideaSubmission.description,
    };
  
    try {
      const data = await post('/idea', newIdea);
      console.log('Idea submitted successfully:', data);
      setMyIdeas([...myIdeas, data]);
      setSelectedTheme(null);
      setModalType(null);
    } catch (err) {
      console.error(err);
    }
  };

  const renderThemesGrid = (themesList: Theme[], isPrevious: boolean = false) => (
    <section className={styles.themesGrid}>
      {themesList.length === 0 ? (
        <p>No {isPrevious ? 'previous' : 'active'} themes found.</p>
      ) : (
        themesList.map((theme) => {
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
                    onClick={() => handleViewTheme(theme.theme_id, isPrevious)}
                  >
                    View Theme
                  </button>
                  {!isPrevious && (
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
                  )}
                </div>
                <span className={styles.status}>Phase: {status.phase}</span>
              </footer>
            </Card>
          );
        })
      )}
    </section>
  );

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1>Dashboard</h1>
        <time className={styles.dateNav} dateTime={new Date().toISOString()}>
          {new Date().toLocaleDateString()}
        </time>
      </header>

      <Tabs 
        tabs={tabs} 
        activeTab={activeTabId} 
        onTabChange={setActiveTabId} 
        className={styles.dashboardTabs}
      />

      <section className={styles.topSection}>
        {activeTabId === 'active-themes' ? (
          renderThemesGrid(themes)
        ) : (
          renderThemesGrid(previousThemes, true)
        )}

        <aside>
          <Card title="Notifications">
            <ul className={styles.notificationsContent}>
              {notifications.length === 0 ? (
                <p>No notifications.</p>
              ) : (
                notifications.map((notification) => (
                  <li key={notification.notification_id}>
                    <NotificationCard {...notification} />
                  </li>
                ))
              )}
            </ul>
          </Card>
        </aside>
      </section>

      <section className={styles.bottomSection}>
        <article>
          <Card title="My Ideas">
            <header className={styles.cardHeader} />
            <ul className={styles.scrollArea}>
              {myIdeas.length === 0 ? (
                <p>You haven't submitted any ideas yet.</p>
              ) : (
                myIdeas.map((idea) => (
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
                ))
              )}
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