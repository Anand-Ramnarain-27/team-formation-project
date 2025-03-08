// Reviews.tsx
import React, { useState, useEffect } from 'react';
import styles from './Review.module.css';
import { User, Group, GroupMember, Review, Question } from '@/app/shared/utils/types';
import Button from '@/app/shared/components/Button/Button';
import FormGroup from '@/app/shared/components/Form/FormGroup';
import TextArea from '@/app/shared/components/Form/TextArea';
import Tabs from '@/app/shared/components/Tabs/Tabs';
import ReviewCard from '@/app/shared/components/ReviewCard/ReviewCard';

type TabType = 'ratings' | 'feedback';

// Base API URL - adjust this to your local development environment
const API_BASE_URL = 'http://localhost:7071/api';

// Extend Review type to support question-based ratings
interface QuestionRating {
  question_id: number;
  rating: '1' | '2' | '3' | '4' | '5';
}

interface ExtendedReview extends Review {
  questionRatings?: QuestionRating[];
  averageRating?: string; // Average calculated from question ratings
}

const Reviews: React.FC = () => {
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [reviews, setReviews] = useState<{ [key: number]: ExtendedReview }>({});
  const [submitted, setSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('ratings');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasSubmittedReviews, setHasSubmittedReviews] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);

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
        let userGroup = null;
        let teamLeadGroup: Group | null = null; // Explicitly define the type // Declare teamLeadGroup here

        // Fetch the user's current group based on their membership or team lead role
        const groupResponse = await fetch(
          `${API_BASE_URL}/groupMember?userId=${currentUserId}`
        );
        if (!groupResponse.ok) {
          throw new Error('Failed to fetch group data');
        }

        const userMembershipData = await groupResponse.json();

        // Find the group where the user is a member or the team lead
        userGroup =
          userMembershipData.length > 0 ? userMembershipData[0] : null;

        if (!userGroup) {
          // If no group is found, check if the user is a team lead
          const teamLeadGroupResponse = await fetch(
            `${API_BASE_URL}/group?teamLead=${currentUserId}`
          );
          if (!teamLeadGroupResponse.ok) {
            throw new Error('Failed to fetch team lead group data');
          }

          const teamLeadGroupData = await teamLeadGroupResponse.json();
          teamLeadGroup =
            teamLeadGroupData.length > 0 ? teamLeadGroupData[0] : null;

          if (!teamLeadGroup) {
            throw new Error('No group found');
          }

          setCurrentGroup(teamLeadGroup);

          // Fetch group members for the team lead's group
          const membersResponse = await fetch(
            `${API_BASE_URL}/groupMember?id=${teamLeadGroup.group_id}`
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
            created_at: member.created_at,
          }));

          // Add the team lead to the list of members if they are not already included
          if (teamLeadGroup.team_lead && teamLeadGroup.team_lead) {
            const teamLeadMember = transformedMembers.find(
              (member: any) => member.user_id === teamLeadGroup?.team_lead
            );

            if (!teamLeadMember) {
              transformedMembers.push({
                group_member_id: -1, // Use a placeholder ID for the team lead
                group_id: teamLeadGroup.group_id,
                user_id: teamLeadGroup.team_lead,
                user: teamLeadGroup.team_lead, // Use the `leader` relation to get the team lead's details
                created_at: teamLeadGroup.created_at, // Use the group's `created_at` as the team lead's `created_at`
              });
            }
          }

          setGroupMembers(transformedMembers);

          // Fetch questions for this theme
          if (teamLeadGroup && teamLeadGroup.theme_id) {
            await fetchQuestions(teamLeadGroup.theme_id);
          }
        } else {
          // If the user is a regular member, proceed as usual
          setCurrentGroup(userGroup.group);

          console.log('Regular Member Theme ID:', userGroup.group.theme_id);

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
            created_at: member.created_at,
          }));

          // Add the team lead to the list of members if they are not already included
          if (userGroup.team_lead && userGroup.leader) {
            const teamLeadMember = transformedMembers.find(
              (member: any) => member.user_id === userGroup.team_lead
            );

            if (!teamLeadMember) {
              transformedMembers.push({
                group_member_id: -1, // Use a placeholder ID for the team lead
                group_id: userGroup.group_id,
                user_id: userGroup.team_lead,
                user: userGroup.leader, // Use the `leader` relation to get the team lead's details
                created_at: userGroup.created_at, // Use the group's `created_at` as the team lead's `created_at`
              });
            }
          }

          setGroupMembers(transformedMembers);

          // Fetch questions for this theme
          if (userGroup.group && userGroup.group.theme_id) {
            await fetchQuestions(userGroup.group.theme_id);
          }
        }

        // Fetch any existing reviews for this group by current user
        const reviewsResponse = await fetch(
          `${API_BASE_URL}/review?reviewer_id=${currentUserId}`
        );
        if (reviewsResponse.ok) {
          const reviewsData = await reviewsResponse.json();

          // Filter reviews by current group
          const groupReviews = reviewsData.filter(
            (review: any) =>
              review.group_id ===
              (userGroup?.group_id || teamLeadGroup?.group_id)
          );

          if (groupReviews.length > 0) {
            setHasSubmittedReviews(true);
          }

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

  // Fetch questions for the theme
  const fetchQuestions = async (themeId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/question?id=${themeId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }
      const data = await response.json();
      setQuestions(data);

      // Initialize reviews with question ratings
      setReviews((prev) => {
        const updatedReviews = { ...prev };
        
        // For each member to review
        groupMembers.forEach((member) => {
          if (member.user.user_id !== currentUserId) {
            // Skip the current user
            const revieweeId = member.user.user_id;
            
            // If there's no review for this member yet, create one
            if (!updatedReviews[revieweeId]) {
              updatedReviews[revieweeId] = {
                reviewer_id: currentUserId || 0,
                reviewee_id: revieweeId,
                group_id: member.group_id,
                rating: '1', // Default rating
                feedback: '',
                created_at: new Date().toISOString(),
                questionRatings: [],
              };
            }
            
            // Initialize question ratings if not already present
            if (!updatedReviews[revieweeId].questionRatings) {
              updatedReviews[revieweeId].questionRatings = [];
            }
            
            // Make sure each question has a rating
            data.forEach((question: Question) => {
              if (question.question_id && 
                  !updatedReviews[revieweeId].questionRatings?.some(
                    qr => qr.question_id === question.question_id
                  )) {
                updatedReviews[revieweeId].questionRatings?.push({
                  question_id: question.question_id,
                  rating: '1', // Default rating
                });
              }
            });
          }
        });
        
        return updatedReviews;
      });
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError('Failed to load review questions. Please try again later.');
    }
  };

  if (!currentGroup) {
    return (
      <main className={styles.container}>
        <p>You are not part of any group.</p>
      </main>
    );
  }

  // Handle changing the rating for a specific question for a specific reviewee
  const handleQuestionRatingChange = (
    revieweeId: number,
    questionId: number,
    rating: '1' | '2' | '3' | '4' | '5'
  ) => {
    if (!currentGroup || !currentUserId) return;
    
    setReviews((prev) => {
      const updatedReview = { ...prev[revieweeId] };
      
      // Initialize questionRatings if it doesn't exist
      if (!updatedReview.questionRatings) {
        updatedReview.questionRatings = [];
      }
      
      // Find the existing question rating or create a new one
      const existingRatingIndex = updatedReview.questionRatings.findIndex(
        qr => qr.question_id === questionId
      );
      
      if (existingRatingIndex >= 0) {
        // Update existing rating
        updatedReview.questionRatings[existingRatingIndex].rating = rating;
      } else {
        // Add new rating
        updatedReview.questionRatings.push({
          question_id: questionId,
          rating,
        });
      }
      
      // Calculate the average rating
      const sum = updatedReview.questionRatings.reduce(
        (acc, qr) => acc + parseInt(qr.rating, 10), 
        0
      );
      const avg = sum / updatedReview.questionRatings.length;
      updatedReview.averageRating = avg.toFixed(1);
      
      return {
        ...prev,
        [revieweeId]: updatedReview,
      };
    });
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
        // Calculate average rating from question ratings
        let averageRating = 3; // Default to middle rating
        
        if (review.questionRatings && review.questionRatings.length > 0) {
          const sum = review.questionRatings.reduce(
            (acc, qr) => acc + parseInt(qr.rating, 10), 
            0
          );
          averageRating = Math.round(sum / review.questionRatings.length);
        }

        // Prepare the review data according to your API schema
        const reviewData = {
          reviewer_id: currentUserId,
          reviewee_id: review.reviewee_id,
          group_id: currentGroup.group_id,
          rating: averageRating, // Send the average rating
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
    (member) => member.user && member.user.user_id !== currentUserId
  );

  // Check if all questions have been rated for all members
  const isAllRatingsProvided = () => {
    if (questions.length === 0) return false;
    
    return membersToReview.every((member) => {
      const review = reviews[member.user.user_id];
      if (!review || !review.questionRatings) return false;
      
      // Check if every question has a rating
      return questions.every((question) => 
        question.question_id && review.questionRatings?.some(
          qr => qr.question_id === question.question_id
        )
      );
    });
  };

  const isAllFeedbackProvided = () =>
    membersToReview.every(
      (member) => (reviews[member.user.user_id]?.feedback?.length || 0) >= 10
    );

  const isSubmitDisabled = hasSubmittedReviews || !isAllFeedbackProvided() || !isAllRatingsProvided();

  const StarRating: React.FC<{ 
    revieweeId: number, 
    questionId: number 
  }> = ({ revieweeId, questionId }) => {
    const review = reviews[revieweeId];
    let currentRating = 0;
    
    if (review && review.questionRatings) {
      const questionRating = review.questionRatings.find(
        qr => qr.question_id === questionId
      );
      if (questionRating) {
        currentRating = Number(questionRating.rating || 0);
      }
    }

    return (
      <div className={styles.starContainer}>
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            onClick={() =>
              handleQuestionRatingChange(
                revieweeId,
                questionId,
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
                  rating={review.averageRating || '3'} // Use the calculated average
                  showGroupName={true}
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
              Please rate each team member on the following criteria
            </p>

            {questions.length === 0 ? (
              <p>No questions available for this review.</p>
            ) : (
              <div className={styles.questionsContainer}>
                {questions.map((question) => (
                  <div key={question.question_id} className={styles.questionSection}>
                    <h3 className={styles.questionText}>{question.question_text}</h3>
                    <ul>
                      {membersToReview.map((member) => (
                        <li key={member.user.user_id} className={styles.studentCard}>
                          <span className={styles.studentName}>{member.user.name}</span>
                          {question.question_id && (
                            <StarRating 
                              revieweeId={member.user.user_id} 
                              questionId={question.question_id} 
                            />
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

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
              <Button onClick={handleSubmit} disabled={isSubmitDisabled}>
                {hasSubmittedReviews ? 'Review Submitted' : 'Submit Review'}
              </Button>
            </nav>
          </form>
        )}
      </section>
    </main>
  );
};

export default Reviews;