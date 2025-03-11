import React, { useState, useEffect } from 'react';
import styles from './Profile.module.css';
import {
  User,
  Idea,
  Group,
  Review,
  ParticipationStats,
  StudentProfileData,
} from '@/app/shared/utils/types';
import Card from '@/app/shared/components/Card/Card';
import Tabs from '@/app/shared/components/Tabs/Tabs';
import GroupCard from '@/app/shared/components/GroupCard/GroupCard';
import ReviewCard from '@/app/shared/components/ReviewCard/ReviewCard';
import IdeaCard from '@/app/shared/components/IdeaCard/IdeaCard';
import useApi from '@/app/shared/hooks/useApi';

type TabType = 'participation' | 'ideas' | 'groups' | 'reviews';

const Profile: React.FC = () => {
  const { get, post, patch, remove, loading, error } = useApi('');
  const [activeTab, setActiveTab] = useState<TabType>('participation');
  const [expandedGroups, setExpandedGroups] = useState<Record<number, boolean>>({});
  const [currentUser, setCurrentUser] = useState<User>();
  const [myIdeas, setMyIdeas] = useState<Idea[]>([]);
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [participationStats, setParticipationStats] = useState<ParticipationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
   const userJson = sessionStorage.getItem('currentUser');

    if (!userJson) {
      return;
    }

    try {
      const user = JSON.parse(userJson) as User;
      setCurrentUser(user);
      console.log(user);
    } catch (err) {
      sessionStorage.removeItem('currentUser');
    }
  }, []);

  const userId = currentUser?.user_id;

  const fetchProfileData = async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      const data = await get(`/studentProfile?userId=${userId}`);
      
      setMyIdeas(data.ideas);
      setMyGroups(data.groups);
      setReviews(data.reviews);
      setParticipationStats(data.participationStats);
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchProfileData();
    }
  }, [userId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const tabs: Array<{ id: TabType; label: string }> = [
    { id: 'participation', label: 'Participation' },
    { id: 'ideas', label: 'Ideas' },
    { id: 'groups', label: 'Groups' },
    { id: 'reviews', label: 'Reviews' },
  ];

  const handleTabChange = (tabId: string) => {
    if (isValidTab(tabId)) {
      setActiveTab(tabId);
    }
  };

  const isValidTab = (tab: string): tab is TabType => {
    return tabs.map((t) => t.id).includes(tab as TabType);
  };

  const handleToggleExpand = (groupId: number) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const ParticipationStat: React.FC<{
    label: string;
    value: number;
    total: number;
  }> = ({ label, value, total }) => (
    <article className={styles.statBar}>
      <h3 className={styles.statLabel}>{label}</h3>
      <div
        className={styles.statBarContainer}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemax={total}
      >
        <div
          className={styles.statBarFill}
          style={{ width: `${(value / total) * 100}%` }}
        />
        <span>{value}</span>
      </div>
    </article>
  );

  return (
    <main className={styles.container}>
      <article className={styles.profileHeader}>
        <figure className={styles.profileAvatar}>
          <svg
            viewBox="0 0 24 24"
            className={styles.avatarIcon}
            role="img"
            aria-label="Profile avatar"
          >
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </figure>

        <section className={styles.profileInfo}>
          <h1 className={styles.profileName}>{currentUser?.name}</h1>
          <address className={styles.profileDate}>{currentUser?.email}</address>
        </section>

        {participationStats && (
          <aside className={styles.profileRating}>
            <p className={styles.ratingValue} aria-label="Average rating">
              {participationStats.averageRating.toFixed(1)}/5
            </p>
            <p className={styles.ratingLabel}>Average Rating</p>
          </aside>
        )}
      </article>

      <nav>
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />
      </nav>

      <section
        className={styles.tabContent}
        role="tabpanel"
        aria-label={`${activeTab} content`}
      >
        {activeTab === 'participation' && (
          <Card title="Participation Overview">
            {isLoading ? (
              <div className={styles.loading}>Loading participation stats...</div>
            ) : participationStats ? (
              <section className={styles.participationStats}>
                <ParticipationStat
                  label="Ideas"
                  value={participationStats.ideas_submitted}
                  total={20}
                />
                <ParticipationStat
                  label="Votes"
                  value={participationStats.votes_cast}
                  total={20}
                />
                <ParticipationStat
                  label="Reviews"
                  value={participationStats.reviews_completed}
                  total={20}
                />
              </section>
            ) : (
              <div className={styles.noData}>No participation data available</div>
            )}
          </Card>
        )}

        {activeTab === 'ideas' && (
          <Card title="Submitted Ideas">
            {isLoading ? (
              <div className={styles.loading}>Loading ideas...</div>
            ) : myIdeas.length > 0 ? (
              <ul className={styles.ideaList}>
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
            ) : (
              <div className={styles.noData}>No ideas submitted yet</div>
            )}
          </Card>
        )}

        {activeTab === 'groups' && (
          <Card title="Group History">
            {isLoading ? (
              <div className={styles.loading}>Loading groups...</div>
            ) : (
              <ul className={styles.groupList}>
                {myGroups.length > 0 ? (
                  myGroups.map((group) => (
                    <li key={group.group_id}>
                      <GroupCard
                        group={group}
                        isExpanded={expandedGroups[group.group_id] || false}
                        onExpand={() => handleToggleExpand(group.group_id)}
                        showActions={true}
                        className={styles.groupItem}
                      />
                    </li>
                  ))
                ) : (
                  <li className={styles.noGroups}>
                    You are not a member of any groups yet.
                  </li>
                )}
              </ul>
            )}
          </Card>
        )}

        {activeTab === 'reviews' && (
          <Card title="Reviews Received">
            {isLoading ? (
              <div className={styles.loading}>Loading reviews...</div>
            ) : reviews.length > 0 ? (
              <ul className={styles.reviewList}>
                {reviews.map((review) => (
                  <li key={review.review_id}>
                    <ReviewCard
                      {...review}
                      showGroupName={true}
                      className={styles.reviewItem}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <div className={styles.noData}>No reviews received yet</div>
            )}
          </Card>
        )}
      </section>
    </main>
  );
};

export default Profile;