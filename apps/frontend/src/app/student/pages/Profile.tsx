import React, { useState } from 'react';
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

  const [profile] = useState<User>({
    user_id: 1,
    name: 'John Doe',
    email: 'john.doe@university.edu',
    role: 'student',
    created_at: '2024-01-15T00:00:00Z',
  });

  const [participationStats] = useState<ParticipationStats>({
    ideas_submitted: 1,
    votes_cast: 3,
    reviews_completed: 3,
    totalIdeas: 5,
    totalVotes: 15,
    totalReviews: 12,
    averageRating: 4.2,
  });

  const [ideas] = useState<Idea[]>([
    {
      idea_id: 1,
      theme_id: 1,
      submitted_by: 1,
      idea_name: 'AI-Powered Study Assistant',
      description: 'An AI assistant to help with studying',
      status: 'Approved',
      created_at: '2024-02-01T00:00:00Z',
      theme_title: 'Educational Technology',
      votes_count: 25,
    },
  ]);

  const [groups] = useState<Group[]>([
    {
      group_id: 1,
      theme_id: 1,
      group_name: 'AI-Powered Study Assistant',
      team_lead: 1,
      created_at: '2024-02-01T00:00:00Z',
      theme_title: 'Educational Technology',
      average_rating: 4.5,
    },
  ]);

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
          <h1 className={styles.profileName}>{profile.name}</h1>
          <address className={styles.profileEmail}>{profile.email}</address>
          <time className={styles.profileDate} dateTime={profile.created_at}>
            Member since {formatDate(profile.created_at)}
          </time>
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
              {ideas.map((idea) => (
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
            <ul className={styles.groupList}>
              {groups.map((group) => (
                <li key={group.group_id}>
                  <GroupCard
                    group={group}
                    showActions={false}
                    className={styles.groupItem}
                  />
                </li>
              ))}
            </ul>
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
