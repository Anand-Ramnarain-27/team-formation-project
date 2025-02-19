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
import StatusBadge from '@/app/shared/components/StatusBadge/StatusBadge';
import Tabs from '@/app/shared/components/Tabs/Tabs';

// Define the tab type to ensure type safety
type TabType = 'participation' | 'ideas' | 'groups' | 'reviews';

const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('participation');

  // Sample data structured according to the database schema
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
    {
      idea_id: 2,
      theme_id: 2,
      submitted_by: 2,
      idea_name: 'Sustainable Campus Initiative',
      description: 'Making our campus more sustainable',
      status: 'Pending',
      created_at: '2024-02-15T00:00:00Z',
      theme_title: 'Green Technology',
      votes_count: 18,
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
    {
      group_id: 2,
      theme_id: 2,
      group_name: 'Sustainable Campus Initiative',
      team_lead: 2,
      created_at: '2024-02-15T00:00:00Z',
      theme_title: 'Green Technology',
      average_rating: 4.2,
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

  // Type-safe tab change handler
  const handleTabChange = (tabId: string) => {
    if (isValidTab(tabId)) {
      setActiveTab(tabId);
    }
  };

  // Type guard to ensure tab is valid
  const isValidTab = (tab: string): tab is TabType => {
    return tabs.map((t) => t.id).includes(tab as TabType);
  };

  const renderParticipationStats = () => (
    <div className={styles.participationStats}>
      <div className={styles.statBar}>
        <div className={styles.statLabel}>Ideas</div>
        <div className={styles.statBarContainer}>
          <div
            className={styles.statBarFill}
            style={{ width: `${(participationStats.totalIdeas / 20) * 100}%` }}
          />
          <span>{participationStats.totalIdeas}</span>
        </div>
      </div>
      <div className={styles.statBar}>
        <div className={styles.statLabel}>Votes</div>
        <div className={styles.statBarContainer}>
          <div
            className={styles.statBarFill}
            style={{ width: `${(participationStats.totalVotes / 20) * 100}%` }}
          />
          <span>{participationStats.totalVotes}</span>
        </div>
      </div>
      <div className={styles.statBar}>
        <div className={styles.statLabel}>Reviews</div>
        <div className={styles.statBarContainer}>
          <div
            className={styles.statBarFill}
            style={{
              width: `${(participationStats.totalReviews / 20) * 100}%`,
            }}
          />
          <span>{participationStats.totalReviews}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      {/* Profile Header */}
      <div className={styles.profileHeader}>
        <div className={styles.profileAvatar}>
          <svg viewBox="0 0 24 24" className={styles.avatarIcon}>
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
        <div className={styles.profileInfo}>
          <h1 className={styles.profileName}>{profile.name}</h1>
          <p className={styles.profileEmail}>{profile.email}</p>
          <p className={styles.profileDate}>
            Member since {formatDate(profile.created_at)}
          </p>
        </div>
        <div className={styles.profileRating}>
          <div className={styles.ratingValue}>
            {participationStats.averageRating}/5
          </div>
          <div className={styles.ratingLabel}>Average Rating</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {activeTab === 'participation' && (
          <Card title="Participation Overview">
            {renderParticipationStats()}
          </Card>
        )}

        {activeTab === 'ideas' && (
          <Card title="Submitted Ideas">
            <div className={styles.ideaList}>
              {ideas.map((idea) => (
                <div key={idea.idea_id} className={styles.ideaItem}>
                  <div className={styles.ideaHeader}>
                    <div>
                      <h3 className={styles.ideaTitle}>{idea.idea_name}</h3>
                      <p className={styles.ideaTheme}>{idea.theme_title}</p>
                    </div>
                    <StatusBadge
                      status={idea.status.toLowerCase()}
                      label={idea.status}
                    />
                  </div>
                  <div className={styles.ideaMeta}>
                    <span>Votes received: {idea.votes_count}</span>
                    <span>Submitted: {formatDate(idea.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === 'groups' && (
          <Card title="Group History">
            <div className={styles.groupList}>
              {groups.map((group) => (
                <div key={group.group_id} className={styles.groupItem}>
                  <div className={styles.groupHeader}>
                    <div>
                      <h3 className={styles.groupTitle}>{group.group_name}</h3>
                      <p className={styles.groupTheme}>{group.theme_title}</p>
                    </div>
                    {group.team_lead === profile.user_id && (
                      <span className={styles.teamLeadBadge}>Team Lead</span>
                    )}
                  </div>
                  <div className={styles.groupMeta}>
                    Average Group Rating: {group.average_rating}/5
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === 'reviews' && (
          <Card title="Reviews Received">
            <div className={styles.reviewList}>
              {reviews.map((review) => (
                <div key={review.review_id} className={styles.reviewItem}>
                  <div className={styles.reviewHeader}>
                    <div>
                      <h3 className={styles.reviewTitle}>
                        {review.group_name}
                      </h3>
                      <p className={styles.reviewDate}>
                        Received: {formatDate(review.created_at)}
                      </p>
                    </div>
                    <span className={styles.reviewRating}>
                      Rating: {review.rating}/5
                    </span>
                  </div>
                  <p className={styles.reviewFeedback}>{review.feedback}</p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Profile;
