import React, { useState, useEffect } from 'react';
import styles from './Review.module.css';

interface User {
  user_id: number;
  name: string;
  role: string;
}

interface Group {
  group_id: number;
  theme_id: number;
  group_name: string;
  team_lead: number;
}

interface GroupMember {
  group_member_id: number;
  group_id: number;
  user_id: number;
  user: User; // Changed to required since we'll filter out undefined users
}

interface Review {
  review_id?: number;
  reviewer_id: number;
  reviewee_id: number;
  group_id: number;
  rating: '1' | '2' | '3' | '4' | '5';
  feedback: string;
}

const Review: React.FC = () => {
  const currentUserId = 1; // This should be dynamic
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [reviews, setReviews] = useState<{ [key: number]: Review }>({});
  const [submitted, setSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState<'ratings' | 'feedback'>('ratings');

  useEffect(() => {
    // Simulate fetching group and member data
    setCurrentGroup({
      group_id: 1,
      theme_id: 1,
      group_name: "Innovation Team Alpha",
      team_lead: 1
    });

    // Note: Now we only set members where we have complete user data
    const fetchedMembers: GroupMember[] = [
      { 
        group_member_id: 1, 
        group_id: 1, 
        user_id: 2, 
        user: { user_id: 2, name: "Jane Smith", role: "student" } 
      },
      { 
        group_member_id: 2, 
        group_id: 1, 
        user_id: 3, 
        user: { user_id: 3, name: "Alex Johnson", role: "student" } 
      },
      { 
        group_member_id: 3, 
        group_id: 1, 
        user_id: 4, 
        user: { user_id: 4, name: "Sarah Wilson", role: "student" } 
      }
    ];
    
    setGroupMembers(fetchedMembers);
  }, []);

  const handleRatingChange = (revieweeId: number, rating: '1' | '2' | '3' | '4' | '5') => {
    if (!currentGroup) return;

    setReviews(prev => ({
      ...prev,
      [revieweeId]: {
        ...prev[revieweeId],
        reviewer_id: currentUserId,
        reviewee_id: revieweeId,
        group_id: currentGroup.group_id,
        rating: rating,
        feedback: prev[revieweeId]?.feedback || ''
      }
    }));
  };

  const handleFeedbackChange = (revieweeId: number, feedback: string) => {
    if (!currentGroup) return;

    setReviews(prev => ({
      ...prev,
      [revieweeId]: {
        ...prev[revieweeId],
        reviewer_id: currentUserId,
        reviewee_id: revieweeId,
        group_id: currentGroup.group_id,
        rating: prev[revieweeId]?.rating || '1',
        feedback: feedback
      }
    }));
  };

  const handleSubmit = async () => {
    const reviewsToSubmit = Object.values(reviews);
    console.log('Submitting reviews:', reviewsToSubmit);
    setSubmitted(true);
  };

  // Filter out current user and get valid members for review
  const membersToReview = groupMembers.filter(member => 
    member.user.user_id !== currentUserId
  );

  const isAllRatingsProvided = () => {
    return membersToReview.every(member => 
      reviews[member.user.user_id]?.rating
    );
  };

  const isAllFeedbackProvided = () => {
    return membersToReview.every(member => 
      reviews[member.user.user_id]?.feedback?.length >= 10
    );
  };

  const StarRating: React.FC<{ revieweeId: number }> = ({ revieweeId }) => {
    const currentRating = Number(reviews[revieweeId]?.rating || 0);

    return (
      <div className={styles.starContainer}>
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            onClick={() => handleRatingChange(revieweeId, rating.toString() as '1' | '2' | '3' | '4' | '5')}
            className={styles.starButton}
          >
            <svg
              viewBox="0 0 24 24"
              className={`${styles.star} ${rating <= currentRating ? styles.starFilled : ''}`}
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        ))}
      </div>
    );
  };

  if (submitted) {
    return (
      <div className={styles.container}>
        <div className={styles.successMessage}>
          Thank you for submitting your reviews! Your feedback helps improve team collaboration.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          {currentGroup ? `${currentGroup.group_name} - Peer Review` : 'Team Member Review'}
        </h1>
      </div>

      <div className={styles.tabList}>
        <button
          className={`${styles.tab} ${activeTab === 'ratings' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('ratings')}
        >
          Ratings
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'feedback' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('feedback')}
          disabled={!isAllRatingsProvided()}
        >
          Written Feedback
        </button>
      </div>

      {activeTab === 'ratings' ? (
        <div>
          <div className={styles.questionTitle}>Rate Your Team Members</div>
          <div className={styles.questionText}>
            Please rate each team member's overall contribution and performance
          </div>

          {membersToReview.map((member) => (
            <div key={member.user.user_id} className={styles.studentCard}>
              <div className={styles.studentName}>{member.user.name}</div>
              <StarRating revieweeId={member.user.user_id} />
            </div>
          ))}

          <div className={styles.buttonContainer}>
            <button
              onClick={() => setActiveTab('feedback')}
              disabled={!isAllRatingsProvided()}
              className={`${styles.button} ${styles.buttonPrimary}`}
            >
              Next: Written Feedback
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className={styles.questionTitle}>Provide Written Feedback</div>
          <div className={styles.questionText}>
            Please provide detailed feedback for each team member (minimum 10 characters).
          </div>

          {membersToReview.map((member) => (
            <div key={member.user.user_id} className={styles.feedbackContainer}>
              <label className={styles.feedbackLabel}>{member.user.name}</label>
              <textarea
                className={styles.feedbackTextarea}
                value={reviews[member.user.user_id]?.feedback || ''}
                onChange={(e) => handleFeedbackChange(member.user.user_id, e.target.value)}
                placeholder="Share your thoughts on their performance, contributions, and areas for improvement..."
              />
              {reviews[member.user.user_id]?.feedback?.length < 10 && (
                <div className={styles.error}>
                  Please provide more detailed feedback (minimum 10 characters)
                </div>
              )}
            </div>
          ))}

          <div className={styles.buttonContainer}>
            <button
              onClick={() => setActiveTab('ratings')}
              className={`${styles.button} ${styles.buttonSecondary}`}
            >
              Back to Ratings
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isAllFeedbackProvided()}
              className={`${styles.button} ${styles.buttonPrimary}`}
            >
              Submit Review
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Review;