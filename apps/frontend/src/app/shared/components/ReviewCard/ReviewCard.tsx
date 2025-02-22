import React from 'react';
import styles from './ReviewCard.module.css';
import { Review } from '../../utils/types';
import Card from '../Card/Card';

interface ReviewCardProps extends Review {
  showGroupName?: boolean;
  className?: string;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  group_name,
  rating,
  feedback,
  created_at,
  showGroupName = true,
  className,
}) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Generate stars based on rating
  const renderStars = () => {
    const stars = [];
    const ratingNum = parseInt(rating);

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <svg
          key={i}
          className={`${styles.star} ${
            i <= ratingNum ? styles.starFilled : ''
          }`}
          viewBox="0 0 24 24"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      );
    }
    return stars;
  };

  return (
    <Card>
      <div className={styles.cardHeader}>
        {showGroupName && group_name && (
          <h2 className={styles.groupName}>{group_name}</h2>
        )}
        <div className={styles.ratingContainer}>
          <div className={styles.stars}>{renderStars()}</div>
          <span className={styles.ratingText}>{rating}/5</span>
        </div>
        <p className={styles.timestamp}>{formatDate(created_at)}</p>
      </div>
      <div className={styles.cardContent}>
        <p className={styles.feedback}>{feedback}</p>
      </div>
    </Card>
  );
};

export default ReviewCard;
