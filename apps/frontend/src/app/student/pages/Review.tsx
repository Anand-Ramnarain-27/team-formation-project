// Review.tsx
import React, { useState, useEffect } from 'react';
import styles from './Review.module.css';
import { User, Group, GroupMember, Review } from '@/app/shared/utils/types';
import Button from '@/app/shared/components/Button/Button';
import FormGroup from '@/app/shared/components/Form/FormGroup';
import TextArea from '@/app/shared/components/Form/TextArea';
import Tabs from '@/app/shared/components/Tabs/Tabs';
import ReviewCard from '@/app/shared/components/ReviewCard/ReviewCard';

type TabType = 'ratings' | 'feedback';

const Reviews: React.FC = () => {
  const currentUserId = 1;
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [reviews, setReviews] = useState<{ [key: number]: Review }>({});
  const [submitted, setSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('ratings');

  const tabs: Array<{ id: TabType; label: string }> = [
    { id: 'ratings', label: 'Ratings' },
    { id: 'feedback', label: 'Feedback' },
  ];

  const handleTabChange = (tabId: string) => {
    if (isValidTab(tabId)) {
      setActiveTab(tabId);
    }
  };

  const isValidTab = (tab: string): tab is TabType => {
    return ['ratings', 'feedback'].includes(tab);
  };

  useEffect(() => {
    setCurrentGroup({
      group_id: 1,
      theme_id: 1,
      group_name: 'Innovation Team Alpha',
      team_lead: 1,
      created_at: '12:00:00',
    });

    setGroupMembers([
      {
        group_member_id: 1,
        group_id: 1,
        user_id: 2,
        user: {
          user_id: 2,
          name: 'Jane Smith',
          email: 'cake@gmail.com',
          role: 'student',
          created_at: '12:00:00',
        },
      },
      {
        group_member_id: 2,
        group_id: 1,
        user_id: 3,
        user: {
          user_id: 3,
          name: 'Alex Johnson',
          email: 'cake@gmail.com',
          role: 'student',
          created_at: '12:00:00',
        },
      },
      {
        group_member_id: 3,
        group_id: 1,
        user_id: 4,
        user: {
          user_id: 4,
          name: 'Sarah Wilson',
          email: 'cake@gmail.com',
          role: 'student',
          created_at: '12:00:00',
        },
      },
    ]);
  }, []);

  const handleRatingChange = (
    revieweeId: number,
    rating: '1' | '2' | '3' | '4' | '5'
  ) => {
    if (!currentGroup) return;
    setReviews((prev) => ({
      ...prev,
      [revieweeId]: {
        ...prev[revieweeId],
        reviewer_id: currentUserId,
        reviewee_id: revieweeId,
        group_id: currentGroup.group_id,
        rating,
        feedback: prev[revieweeId]?.feedback || '',
      },
    }));
  };

  const handleFeedbackChange = (revieweeId: number, feedback: string) => {
    if (!currentGroup) return;
    setReviews((prev) => ({
      ...prev,
      [revieweeId]: {
        ...prev[revieweeId],
        reviewer_id: currentUserId,
        reviewee_id: revieweeId,
        group_id: currentGroup.group_id,
        rating: prev[revieweeId]?.rating || '1',
        feedback,
      },
    }));
  };

  const handleSubmit = async () => {
    console.log('Submitting reviews:', Object.values(reviews));
    setSubmitted(true);
  };

  const membersToReview = groupMembers.filter(
    (member) => member.user.user_id !== currentUserId
  );

  const isAllRatingsProvided = () =>
    membersToReview.every((member) => reviews[member.user.user_id]?.rating);

  const isAllFeedbackProvided = () =>
    membersToReview.every(
      (member) => (reviews[member.user.user_id]?.feedback?.length || 0) >= 10
    );

  const StarRating: React.FC<{ revieweeId: number }> = ({ revieweeId }) => {
    const currentRating = Number(reviews[revieweeId]?.rating || 0);

    return (
      <div className={styles.starContainer}>
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            onClick={() =>
              handleRatingChange(
                revieweeId,
                rating.toString() as '1' | '2' | '3' | '4' | '5'
              )
            }
            className={styles.starButton}
            aria-label={`Rate ${rating} stars`}
          >
            <svg
              viewBox="0 0 24 24"
              className={`${styles.star} ${
                rating <= currentRating ? styles.starFilled : ''
              }`}
              role="img"
              aria-hidden="true"
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
      <main className={styles.container}>
        <section className={styles.successContainer}>
          <p className={styles.successMessage}>
            Thank you for submitting your reviews! Your feedback helps improve
            team collaboration.
          </p>
          <ul className={styles.reviewSummary}>
            {Object.values(reviews).map((review) => (
              <li key={review.reviewee_id}>
                <ReviewCard
                  {...review}
                  showGroupName={false}
                  created_at={new Date().toISOString()}
                />
              </li>
            ))}
          </ul>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          {currentGroup
            ? `${currentGroup.group_name} - Peer Review`
            : 'Team Member Review'}
        </h1>
      </header>

      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />

      <section>
        {activeTab === 'ratings' ? (
          <form>
            <h2 className={styles.questionTitle}>Rate Your Team Members</h2>
            <p className={styles.questionText}>
              Please rate each team member's overall contribution and
              performance
            </p>

            <ul>
              {membersToReview.map((member) => (
                <li key={member.user.user_id} className={styles.studentCard}>
                  <span className={styles.studentName}>{member.user.name}</span>
                  <StarRating revieweeId={member.user.user_id} />
                </li>
              ))}
            </ul>

            <nav className={styles.buttonContainer}>
              <Button
                onClick={() => setActiveTab('feedback')}
                disabled={!isAllRatingsProvided()}
              >
                Next: Written Feedback
              </Button>
            </nav>
          </form>
        ) : (
          <form>
            <h2 className={styles.questionTitle}>Provide Written Feedback</h2>
            <p className={styles.questionText}>
              Please provide detailed feedback for each team member (minimum 10
              characters).
            </p>

            <ul>
              {membersToReview.map((member) => (
                <li
                  key={member.user.user_id}
                  className={styles.feedbackContainer}
                >
                  <FormGroup label={`Feedback for ${member.user.name}`}>
                    <TextArea
                      value={reviews[member.user.user_id]?.feedback || ''}
                      onChange={(e) =>
                        handleFeedbackChange(member.user.user_id, e)
                      }
                      placeholder="Provide constructive feedback..."
                      rows={5}
                    />
                  </FormGroup>
                  {(reviews[member.user.user_id]?.feedback?.length || 0) <
                    10 && (
                    <p className={styles.error}>
                      Please provide more detailed feedback (minimum 10
                      characters)
                    </p>
                  )}
                </li>
              ))}
            </ul>

            <nav className={styles.buttonContainer}>
              <Button onClick={() => setActiveTab('ratings')}>
                Back to Ratings
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!isAllFeedbackProvided()}
              >
                Submit Review
              </Button>
            </nav>
          </form>
        )}
      </section>
    </main>
  );
};

export default Reviews;
