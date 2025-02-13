// Notifications.tsx
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './Notifications.module.css';

type Notification = {
  notification_id: number;
  recipient_role: string;
  message: string;
  created_by: number;
  created_at: string;
};

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
    <div className={styles.notificationCard}>
      <div className={styles.notificationContent}>
        <div className={getIconClass()} />
        <div className={styles.notificationText}>
          <p className={styles.message}>{notification.message}</p>
          <p className={styles.timestamp}>
            {new Date(notification.created_at).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

const CreateNotification = ({
  onNotificationCreate,
}: {
  onNotificationCreate: (message: string, role: string) => void;
}) => {
  const [message, setMessage] = useState('');
  const [recipientRole, setRecipientRole] = useState('all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onNotificationCreate(message, recipientRole);
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.createForm}>
      <h2 className={styles.formTitle}>Create New Notification</h2>
      <div className={styles.formGroup}>
        <label htmlFor="recipient" className={styles.label}>
          Send to:
        </label>
        <select
          id="recipient"
          value={recipientRole}
          onChange={(e) => setRecipientRole(e.target.value)}
          className={styles.select}
        >
          <option value="all">All Users</option>
          <option value="student">Students Only</option>
          <option value="team_lead">Team Leads Only</option>
        </select>
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="message" className={styles.label}>
          Message:
        </label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={styles.textarea}
          placeholder="Enter notification message..."
          rows={3}
        />
      </div>
      <button type="submit" className={styles.submitButton}>
        Send Notification
      </button>
    </form>
  );
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const isAdmin = location.pathname.includes('/admin');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Mock data - replace with actual API call
        const mockNotifications: Notification[] = [
          {
            notification_id: 1,
            recipient_role: isAdmin ? 'admin' : 'student',
            message: 'New theme "Web Development" has been created',
            created_by: 1,
            created_at: new Date().toISOString(),
          },
          {
            notification_id: 2,
            recipient_role: isAdmin ? 'admin' : 'student',
            message: 'Deadline for idea submission is approaching',
            created_by: 1,
            created_at: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            notification_id: 3,
            recipient_role: isAdmin ? 'admin' : 'student',
            message: 'New review submitted for your group',
            created_by: 1,
            created_at: new Date(Date.now() - 172800000).toISOString(),
          },
        ];
        setNotifications(mockNotifications);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [isAdmin]);

  const handleCreateNotification = async (message: string, role: string) => {
    try {
      // In a real implementation, this would be an API call
      const newNotification: Notification = {
        notification_id: Date.now(),
        recipient_role: role,
        message,
        created_by: 1, // Replace with actual admin ID
        created_at: new Date().toISOString(),
      };

      setNotifications([newNotification, ...notifications]);
      // Add success message or toast here
    } catch (error) {
      console.error('Error creating notification:', error);
      // Add error handling here
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.bellIcon} />
        <h1 className={styles.title}>
          {isAdmin ? 'System Notifications' : 'Your Notifications'}
        </h1>
        <p className={styles.subtitle}>
          {isAdmin
            ? 'Manage and send notifications to users'
            : 'Stay updated with your team activities and project deadlines'}
        </p>
      </div>

      {isAdmin && (
        <div className={styles.createSection}>
          <CreateNotification onNotificationCreate={handleCreateNotification} />
        </div>
      )}

      <div className={styles.content}>
        <h2 className={styles.sectionTitle}>
          {isAdmin ? 'Sent Notifications' : 'Notifications'}
        </h2>
        {loading ? (
          <div className={styles.loadingState}>Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className={styles.emptyState}>No notifications found</div>
        ) : (
          <div className={styles.notificationsList}>
            {notifications.map((notification) => (
              <NotificationCard
                key={notification.notification_id}
                notification={notification}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
