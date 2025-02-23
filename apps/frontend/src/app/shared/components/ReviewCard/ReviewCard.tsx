import React from 'react';
import styles from './ReviewCard.module.css';
import Card from '../Card/Card';

type ReviewCardProps = {
  group_name?: string;
  rating: string;
  feedback: string;
  created_at: string;
  showGroupName?: boolean;
  className?: string;
};

const ReviewCard = ({
  group_name,
  rating,
  feedback,
  created_at,
  showGroupName = true,
  className,
}: ReviewCardProps) => {
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
          i < parseInt(rating) ? styles.starFilled : ''
        }`}
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ));

  return (
    <Card>
      <article className={styles.reviewCard}>
        <header className={styles.cardHeader}>
          {showGroupName && group_name && (
            <h2 className={styles.groupName}>{group_name}</h2>
          )}
          <section className={styles.ratingContainer}>
            <span
              className={styles.stars}
              role="img"
              aria-label={`Rating: ${rating} out of 5 stars`}
            >
              {renderStars()}
            </span>
            <span className={styles.ratingText}>{rating}/5</span>
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
