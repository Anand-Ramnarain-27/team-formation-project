import React from 'react';
import styles from './NotificationCard.module.css';
import { Notification } from '@/app/shared/utils/types';
import Card from '../Card/Card';

const NotificationCard: React.FC<Notification> = ({
  message,
  created_at,
  status = 'info',
}) => {
  return (
    <Card className={`${styles.notificationCard} ${styles[status]}`}>
      <div className={styles.notificationContent}>
        <p className={styles.message}>{message}</p>
        <p className={styles.timestamp}>
          {new Date(created_at).toLocaleString()}
        </p>
      </div>
    </Card>
  );
};

export default NotificationCard;
