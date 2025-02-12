// ReviewForm.tsx
import React, { useState } from 'react';
import styles from './Review.module.css';

interface Student {
  id: number;
  name: string;
}

interface ReviewQuestion {
  id: number;
  text: string;
}

interface Reviews {
  [key: number]: {
    [key: number]: number;
  };
}

interface Feedback {
  [key: number]: string;
}

const Review: React.FC = () => {
  const [reviews, setReviews] = useState<Reviews>({});
  const [feedback, setFeedback] = useState<Feedback>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [activeTab, setActiveTab] = useState<'ratings' | 'feedback'>('ratings');
  const [submitted, setSubmitted] = useState(false);

  const reviewQuestions: ReviewQuestion[] = [
    {
      id: 1,
      text: 'How well does this student contribute to team discussions?',
    },
    { id: 2, text: 'Rate their ability to meet deadlines and commitments' },
    { id: 3, text: 'How effectively do they communicate with team members?' },
    {
      id: 4,
      text: 'Rate their technical skills and contribution to the project',
    },
    {
      id: 5,
      text: 'How well do they collaborate and support other team members?',
    },
  ];

  const students: Student[] = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' },
    { id: 3, name: 'Alex Johnson' },
  ];

  const handleRatingClick = (studentId: number, rating: number) => {
    setReviews((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [reviewQuestions[currentQuestion].id]: rating,
      },
    }));
  };

  const handleFeedbackChange = (studentId: number, value: string) => {
    setFeedback((prev) => ({
      ...prev,
      [studentId]: value,
    }));
  };

  const handleNext = () => {
    if (currentQuestion < reviewQuestions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      setActiveTab('feedback');
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    const submissionData = {
      ratings: reviews,
      writtenFeedback: feedback,
    };
    console.log('Submitting reviews:', submissionData);
    setSubmitted(true);
  };

  const isQuestionAnsweredForAllStudents = () => {
    return students.every(
      (student) => reviews[student.id]?.[reviewQuestions[currentQuestion].id]
    );
  };

  const isAllQuestionsAnswered = () => {
    return students.every((student) =>
      reviewQuestions.every((question) => reviews[student.id]?.[question.id])
    );
  };

  const isAllFeedbackProvided = () => {
    return students.every(
      (student) => feedback[student.id]?.trim().length >= 10
    );
  };

  const StarRating: React.FC<{ studentId: number }> = ({ studentId }) => {
    const currentRating =
      reviews[studentId]?.[reviewQuestions[currentQuestion].id] || 0;

    return (
      <div className={styles.starContainer}>
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            onClick={() => handleRatingClick(studentId, rating)}
            className={styles.starButton}
          >
            <svg
              viewBox="0 0 24 24"
              className={`${styles.star} ${
                rating <= currentRating ? styles.starFilled : ''
              }`}
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
          Thank you for submitting your reviews! Your feedback helps improve
          team collaboration.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Team Member Review</h1>
      </div>

      <div className={styles.tabList}>
        <button
          className={`${styles.tab} ${
            activeTab === 'ratings' ? styles.tabActive : ''
          }`}
          onClick={() => setActiveTab('ratings')}
        >
          Ratings
        </button>
        <button
          className={`${styles.tab} ${
            activeTab === 'feedback' ? styles.tabActive : ''
          }`}
          onClick={() => setActiveTab('feedback')}
          disabled={!isAllQuestionsAnswered()}
        >
          Written Feedback
        </button>
      </div>

      {activeTab === 'ratings' ? (
        <div>
          <div className={styles.questionTitle}>
            Question {currentQuestion + 1} of {reviewQuestions.length}
          </div>
          <div className={styles.questionText}>
            {reviewQuestions[currentQuestion].text}
          </div>

          {students.map((student) => (
            <div key={student.id} className={styles.studentCard}>
              <div className={styles.studentName}>{student.name}</div>
              <StarRating studentId={student.id} />
            </div>
          ))}

          <div className={styles.buttonContainer}>
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className={`${styles.button} ${styles.buttonSecondary}`}
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={!isQuestionAnsweredForAllStudents()}
              className={`${styles.button} ${styles.buttonPrimary}`}
            >
              Next Question
            </button>
          </div>

          <div className={styles.progress}>
            Progress: {currentQuestion + 1} of {reviewQuestions.length}{' '}
            questions
          </div>
        </div>
      ) : (
        <div>
          <div className={styles.questionTitle}>Provide Written Feedback</div>
          <div className={styles.questionText}>
            Please provide detailed feedback for each team member (minimum 10
            characters).
          </div>

          {students.map((student) => (
            <div key={student.id} className={styles.feedbackContainer}>
              <label className={styles.feedbackLabel}>{student.name}</label>
              <textarea
                className={styles.feedbackTextarea}
                value={feedback[student.id] || ''}
                onChange={(e) =>
                  handleFeedbackChange(student.id, e.target.value)
                }
                placeholder="Share your thoughts on their performance, contributions, and areas for improvement..."
              />
              {feedback[student.id]?.length < 10 && (
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
