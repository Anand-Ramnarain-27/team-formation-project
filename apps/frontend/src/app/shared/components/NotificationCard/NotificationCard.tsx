import React from 'react';
import Card from '@/app/shared/components/Card/Card';
import styles from '@/app/shared/pages/Notifications.module.css'
import { Notification } from '@/app/shared/utils/types';

const NotificationCard = ({ notification }: { notification: Notification }) => {
  const getIconClass = () => {
    if (notification.message.toLowerCase().includes('deadline')) {
      return styles.warningIcon;
    } else if (notification.message.toLowerCase().includes('review')) {
      return styles.successIcon;
    }
    return styles.infoIcon;
  };
  return (
    <Card className={styles.notificationCard}>
      <div className={styles.notificationContent}>
        <div className={getIconClass()} />
        <div className={styles.notificationText}>
          <p className={styles.message}>{notification.message}</p>
          <p className={styles.timestamp}>
            {new Date(notification.created_at).toLocaleString()}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default NotificationCard
