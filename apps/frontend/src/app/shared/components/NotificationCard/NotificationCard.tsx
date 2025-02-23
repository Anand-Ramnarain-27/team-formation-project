import React from 'react';
import styles from './NotificationCard.module.css';
import { Notification } from '@/app/shared/utils/types';

const NotificationCard: React.FC<Notification> = ({
  message,
  created_at,
  status = 'info',
}) => {
  return (
    <article className={`${styles.notificationCard} ${styles[status]}`}>
      <p className={styles.message}>{message}</p>
      <time className={styles.timestamp} dateTime={created_at}>
        {new Date(created_at).toLocaleString()}
      </time>
    </article>
  );
};

export default NotificationCard;
