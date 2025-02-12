// StudentProfile.tsx
import React, { useState } from 'react';
import styles from './Profile.module.css';

// TypeScript interfaces
interface StudentProfile {
  user_id: number;
  name: string;
  email: string;
  created_at: string;
  participationStats: {
    totalIdeas: number;
    totalVotes: number;
    totalReviews: number;
    averageRating: number;
  };
}

interface IdeaHistory {
  idea_id: number;
  idea_name: string;
  theme_title: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  created_at: string;
  votes_received: number;
}

interface ReviewHistory {
  review_id: number;
  group_name: string;
  rating: number;
  feedback: string;
  created_at: string;
}

interface GroupHistory {
  group_id: number;
  theme_title: string;
  group_name: string;
  is_team_lead: boolean;
  average_rating: number;
}

const Profile: React.FC = () => {
  // Active tab state
  const [activeTab, setActiveTab] = useState<'participation' | 'ideas' | 'groups' | 'reviews'>('participation');

  // Sample data - replace with actual API calls
  const [profile] = useState<StudentProfile>({
    user_id: 1,
    name: "John Doe",
    email: "john.doe@university.edu",
    created_at: "2024-01-15",
    participationStats: {
      totalIdeas: 5,
      totalVotes: 15,
      totalReviews: 12,
      averageRating: 4.2
    }
  });

  const [ideaHistory] = useState<IdeaHistory[]>([
    {
      idea_id: 1,
      idea_name: "AI-Powered Study Assistant",
      theme_title: "Educational Technology",
      status: "Approved",
      created_at: "2024-02-01",
      votes_received: 25
    },
    {
      idea_id: 2,
      idea_name: "Sustainable Campus Initiative",
      theme_title: "Green Technology",
      status: "Pending",
      created_at: "2024-02-15",
      votes_received: 18
    }
  ]);

  const [groupHistory] = useState<GroupHistory[]>([
    {
      group_id: 1,
      theme_title: "Educational Technology",
      group_name: "AI-Powered Study Assistant",
      is_team_lead: true,
      average_rating: 4.5
    },
    {
      group_id: 2,
      theme_title: "Green Technology",
      group_name: "Sustainable Campus Initiative",
      is_team_lead: false,
      average_rating: 4.2
    }
  ]);

  const [reviewHistory] = useState<ReviewHistory[]>([
    {
      review_id: 1,
      group_name: "AI-Powered Study Assistant",
      rating: 4,
      feedback: "Great team player, always contributes meaningful ideas",
      created_at: "2024-03-01"
    }
  ]);

  // Helper function to format dates
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Render participation stats with custom bars
  const renderParticipationStats = () => (
    <div className={styles.participationStats}>
      <div className={styles.statBar}>
        <div className={styles.statLabel}>Ideas</div>
        <div className={styles.statBarContainer}>
          <div 
            className={styles.statBarFill} 
            style={{ width: `${(profile.participationStats.totalIdeas / 20) * 100}%` }}
          />
          <span>{profile.participationStats.totalIdeas}</span>
        </div>
      </div>
      <div className={styles.statBar}>
        <div className={styles.statLabel}>Votes</div>
        <div className={styles.statBarContainer}>
          <div 
            className={styles.statBarFill} 
            style={{ width: `${(profile.participationStats.totalVotes / 20) * 100}%` }}
          />
          <span>{profile.participationStats.totalVotes}</span>
        </div>
      </div>
      <div className={styles.statBar}>
        <div className={styles.statLabel}>Reviews</div>
        <div className={styles.statBarContainer}>
          <div 
            className={styles.statBarFill} 
            style={{ width: `${(profile.participationStats.totalReviews / 20) * 100}%` }}
          />
          <span>{profile.participationStats.totalReviews}</span>
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
          <p className={styles.profileDate}>Member since {formatDate(profile.created_at)}</p>
        </div>
        <div className={styles.profileRating}>
          <div className={styles.ratingValue}>{profile.participationStats.averageRating}/5</div>
          <div className={styles.ratingLabel}>Average Rating</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className={styles.tabs}>
        <button 
          className={`${styles.tabButton} ${activeTab === 'participation' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('participation')}
        >
          Participation
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'ideas' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('ideas')}
        >
          Ideas
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'groups' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('groups')}
        >
          Groups
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'reviews' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          Reviews
        </button>
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {activeTab === 'participation' && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Participation Overview</h2>
            {renderParticipationStats()}
          </div>
        )}

        {activeTab === 'ideas' && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Submitted Ideas</h2>
            <div className={styles.ideaList}>
              {ideaHistory.map(idea => (
                <div key={idea.idea_id} className={styles.ideaItem}>
                  <div className={styles.ideaHeader}>
                    <div>
                      <h3 className={styles.ideaTitle}>{idea.idea_name}</h3>
                      <p className={styles.ideaTheme}>{idea.theme_title}</p>
                    </div>
                    <span className={`${styles.status} ${styles[idea.status.toLowerCase()]}`}>
                      {idea.status}
                    </span>
                  </div>
                  <div className={styles.ideaMeta}>
                    <span>Votes received: {idea.votes_received}</span>
                    <span>Submitted: {formatDate(idea.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'groups' && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Group History</h2>
            <div className={styles.groupList}>
              {groupHistory.map(group => (
                <div key={group.group_id} className={styles.groupItem}>
                  <div className={styles.groupHeader}>
                    <div>
                      <h3 className={styles.groupTitle}>{group.group_name}</h3>
                      <p className={styles.groupTheme}>{group.theme_title}</p>
                    </div>
                    {group.is_team_lead && (
                      <span className={styles.teamLeadBadge}>Team Lead</span>
                    )}
                  </div>
                  <div className={styles.groupMeta}>
                    Average Group Rating: {group.average_rating}/5
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Reviews Received</h2>
            <div className={styles.reviewList}>
              {reviewHistory.map(review => (
                <div key={review.review_id} className={styles.reviewItem}>
                  <div className={styles.reviewHeader}>
                    <div>
                      <h3 className={styles.reviewTitle}>{review.group_name}</h3>
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
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;