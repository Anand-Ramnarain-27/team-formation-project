import React, { useState, useEffect } from 'react';
import styles from './ReviewCard.module.css';
import Card from '../Card/Card';

type ReviewCardProps = {
  group_name?: string;
  rating: string;
  feedback: string;
  created_at: string;
  showGroupName?: boolean;
  className?: string;
  group_id: number;
};

const ReviewCard = ({
  rating,
  feedback,
  created_at,
  showGroupName = true,
  className,
  group_id,
}: ReviewCardProps) => {
  const [graupNames, setGroupNames] = useState<string>('Loading...');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Parse the rating enum (e.g., RATING_1, RATING_2) to get numeric value
  let numericRating = '1';
  if (rating && typeof rating === 'string' && rating.match(/RATING_\d+/)) {
    const ratingMatch = rating.match(/RATING_(\d+)/);
    if (ratingMatch && ratingMatch[1]) {
      numericRating = ratingMatch[1];
    }
  } else {
    // If it's already a number or number as string, use it directly
    numericRating = rating;
  }

  // Convert to number for comparison
  const ratingValue = Number(numericRating);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  const renderStars = () =>
    Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`${styles.star} ${
          i < ratingValue ? styles.starFilled : ''
        }`}
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ));

  const fetchGroupNames = async () => {
    try {
      if (group_id) {
        const response = await fetch(
          `http://localhost:7071/api/group?id=${group_id}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch user');
        }

        const group = await response.json();

        if (group) {
          setGroupNames(group.group_name);
        } else {
          setGroupNames('Unknown User');
        }
      }
    } catch (error) {
      console.error('Error fetching submitter name:', error);
      setGroupNames('Unknown Group');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchGroupNames()]);
      setIsLoading(false);
    };

    if (group_id) {
      loadData();
    }
  }, [group_id]);

  return (
    <Card>
      <article className={styles.reviewCard}>
        <header className={styles.cardHeader}>
          {showGroupName && graupNames && (
            <h2 className={styles.groupName}>{graupNames}</h2>
          )}
          <section className={styles.ratingContainer}>
            <span
              className={styles.stars}
              role="img"
              aria-label={`Rating: ${ratingValue} out of 5 stars`}
            >
              {renderStars()}
            </span>
            <span className={styles.ratingText}>{ratingValue}/5</span>
          </section>
          <time className={styles.timestamp} dateTime={created_at}>
            {formatDate(created_at)}
          </time>
        </header>
        <p className={styles.feedback}>{feedback}</p>
      </article>
    </Card>
  );
};

export default ReviewCard;