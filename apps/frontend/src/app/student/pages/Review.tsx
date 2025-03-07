// Reviews.tsx
import React, { useState, useEffect } from 'react';
import styles from './Review.module.css';
import { User, Group, GroupMember, Review } from '@/app/shared/utils/types';
import Button from '@/app/shared/components/Button/Button';
import FormGroup from '@/app/shared/components/Form/FormGroup';
import TextArea from '@/app/shared/components/Form/TextArea';
import Tabs from '@/app/shared/components/Tabs/Tabs';
import ReviewCard from '@/app/shared/components/ReviewCard/ReviewCard';

type TabType = 'ratings' | 'feedback';

// Base API URL - adjust this to your local development environment
const API_BASE_URL = 'http://localhost:7071/api';

const Reviews: React.FC = () => {
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [reviews, setReviews] = useState<{ [key: number]: Review }>({});
  const [submitted, setSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('ratings');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    const userJson = localStorage.getItem('currentUser');

    if (!userJson) {
      setError("You're not logged in. Please log in to view notifications.");
      return;
    }

    try {
      const user = JSON.parse(userJson) as User;
      const userId = user.user_id;
      setCurrentUserId(userId);
      setLoading(false);
    } catch (err) {
      setError('Invalid user data. Please log in again.');
      localStorage.removeItem('currentUser');
    }
  }, []);

  // Fetch group and members data
  useEffect(() => {
    const fetchGroupData = async () => {
      if (!currentUserId) return;

      setLoading(true);
      try {
        // Fetch the user's current group
        const groupResponse = await fetch(
          `${API_BASE_URL}/group?teamLead=${currentUserId}`
        );
        if (!groupResponse.ok) {
          throw new Error('Failed to fetch group data');
        }

        const groupsData = await groupResponse.json();
        // Find the group where the user is either a team lead or a member
        const userGroup =
          Array.isArray(groupsData) && groupsData.length > 0
            ? groupsData[0]
            : null;

        if (!userGroup) {
          throw new Error('No group found');
        }

        setCurrentGroup(userGroup);

        // Fetch group members
        const membersResponse = await fetch(
          `${API_BASE_URL}/groupMember?id=${userGroup.group_id}`
        );
        if (!membersResponse.ok) {
          throw new Error('Failed to fetch group members');
        }
        const membersData = await membersResponse.json();

        // Transform the data to match the expected GroupMember structure
        const transformedMembers = membersData.map((member: any) => ({
          group_member_id: member.group_member_id,
          group_id: member.group_id,
          user_id: member.user_id,
          user: member.member,
        }));

        setGroupMembers(transformedMembers);

        // Fetch any existing reviews for this group by current user
        const reviewsResponse = await fetch(
          `${API_BASE_URL}/review?reviewer_id=${currentUserId}`
        );
        if (reviewsResponse.ok) {
          const reviewsData = await reviewsResponse.json();

          // Filter reviews by current group
          const groupReviews = reviewsData.filter(
            (review: any) => review.group_id === userGroup.group_id
          );

          // Convert array to object with reviewee_id as keys
          const reviewsObject = groupReviews.reduce((acc: any, review: any) => {
            // Parse the rating enum (e.g., RATING_1, RATING_2) to get numeric value
            let numericRating = '1';
            if (review.rating) {
              const ratingMatch = review.rating.match(/RATING_(\d+)/);
              if (ratingMatch && ratingMatch[1]) {
                numericRating = ratingMatch[1];
              }
            }

            acc[review.reviewee_id] = {
              ...review,
              rating: numericRating,
            };
            return acc;
          }, {});

          setReviews(reviewsObject);
        }
      } catch (err) {
        setError('Error loading group data. Please try again later.');
        console.error('Error fetching group data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGroupData();
  }, [currentUserId]);

  const handleRatingChange = (
    revieweeId: number,
    rating: '1' | '2' | '3' | '4' | '5'
  ) => {
    if (!currentGroup || !currentUserId) return;
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
    if (!currentGroup || !currentUserId) return;
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
    if (!currentGroup || !currentUserId) return;
    setError(null);

    try {
      // Process reviews to match the expected API format
      const reviewPromises = Object.values(reviews).map(async (review) => {
        // Convert string rating to number for the API
        const numericRating = parseInt(review.rating, 10);

        // Prepare the review data according to your API schema
        const reviewData = {
          reviewer_id: currentUserId,
          reviewee_id: review.reviewee_id,
          group_id: currentGroup.group_id,
          rating: numericRating, // API expects a number (1-5)
          feedback: review.feedback,
        };

        // Create the review
        const response = await fetch(`${API_BASE_URL}/review`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(reviewData),
        });

        if (!response.ok) {
          throw new Error(`Error submitting review: ${response.statusText}`);
        }

        return response.json();
      });

      // Wait for all review submissions to complete
      await Promise.all(reviewPromises);
      setSubmitted(true);
    } catch (err) {
      setError('Error submitting reviews. Please try again.');
      console.error('Error submitting reviews:', err);
    }
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

  if (loading) {
    return (
      <main className={styles.container}>
        <p>Loading review data...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.container}>
        <p className={styles.error}>{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </main>
    );
  }

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
