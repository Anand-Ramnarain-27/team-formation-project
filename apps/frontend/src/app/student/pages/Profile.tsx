import React, { useState, useEffect } from 'react';
import styles from './Profile.module.css';
import {
  User,
  Idea,
  Group,
  Review,
  ParticipationStats,
} from '@/app/shared/utils/types';
import Card from '@/app/shared/components/Card/Card';
import Tabs from '@/app/shared/components/Tabs/Tabs';
import GroupCard from '@/app/shared/components/GroupCard/GroupCard';
import ReviewCard from '@/app/shared/components/ReviewCard/ReviewCard';
import IdeaCard from '@/app/shared/components/IdeaCard/IdeaCard';

type TabType = 'participation' | 'ideas' | 'groups' | 'reviews';

const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('participation');
  const [expandedGroups, setExpandedGroups] = useState<Record<number, boolean>>(
    {}
  );
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User>();
  const [myIdeas, setMyIdeas] = useState<Idea[]>([]);
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const userId = currentUser?.user_id;

  const [participationStats] = useState<ParticipationStats>({
    ideas_submitted: 1,
    votes_cast: 3,
    reviews_completed: 3,
    totalIdeas: 5,
    totalVotes: 15,
    totalReviews: 12,
    averageRating: 4.2,
  });

  // Fetch my ideas
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

  // Fetch groups the user is a member of or is team lead for
const fetchMyGroups = async () => {
  try {
    // First, get groups where user is a member
    const memberResponse = await fetch(
      `http://localhost:7071/api/getUserGroups?id=${userId}`
    );
    if (!memberResponse.ok) {
      throw new Error('Failed to fetch member groups');
    }
    const memberData = await memberResponse.json();
    
    // Then, get groups where user is team lead
    const leadResponse = await fetch(
      `http://localhost:7071/api/group?teamLead=${userId}`
    );
    if (!leadResponse.ok) {
      throw new Error('Failed to fetch team lead groups');
    }
    const leadData = await leadResponse.json();
    
    // Combine the results, ensuring no duplicates
    let groupsList = [];
    
    // Extract the group objects from the member response
    if (Array.isArray(memberData) && memberData.length > 0) {
      groupsList = memberData.map(item => item.group);
    }
    
    // Add groups where user is team lead, avoiding duplicates
    if (Array.isArray(leadData) && leadData.length > 0) {
      for (const leadGroup of leadData) {
        const isDuplicate = groupsList.some(group => group.group_id === leadGroup.group_id);
        if (!isDuplicate) {
          groupsList.push(leadGroup);
        }
      }
    }
    
    setMyGroups(groupsList);
  } catch (err) {
    setError('Error fetching my groups');
    console.error(err);
  }
};

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchMyIdeas(),
        fetchMyGroups()
      ]);
      setIsLoading(false);
    };

    if (userId) {
      loadData();
    }
  }, [userId]);

  const [reviews] = useState<Review[]>([
    {
      review_id: 1,
      reviewer_id: 2,
      reviewee_id: 1,
      group_id: 1,
      rating: '4',
      feedback: 'Great team player, always contributes meaningful ideas',
      created_at: '2024-03-01T00:00:00Z',
      group_name: 'AI-Powered Study Assistant',
    },
  ]);

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

        <aside className={styles.profileRating}>
          <p className={styles.ratingValue} aria-label="Average rating">
            {participationStats.averageRating}/5
          </p>
          <p className={styles.ratingLabel}>Average Rating</p>
        </aside>
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
            <section className={styles.participationStats}>
              <ParticipationStat
                label="Ideas"
                value={participationStats.totalIdeas}
                total={20}
              />
              <ParticipationStat
                label="Votes"
                value={participationStats.totalVotes}
                total={20}
              />
              <ParticipationStat
                label="Reviews"
                value={participationStats.totalReviews}
                total={20}
              />
            </section>
          </Card>
        )}

        {activeTab === 'ideas' && (
          <Card title="Submitted Ideas">
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
                        isExpanded={expandedGroups[group.group_id]}
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
          </Card>
        )}
      </section>
    </main>
  );
};

export default Profile;