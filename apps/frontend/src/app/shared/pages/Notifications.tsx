import React, { useState, useEffect } from 'react';
import styles from './Notifications.module.css';
import { User, Notification } from '@/app/shared/utils/types';
import Button from '@/app/shared/components/Button/Button';
import FormGroup from '@/app/shared/components/Form/FormGroup';
import TextArea from '@/app/shared/components/Form/TextArea';
import SelectInput from '@/app/shared/components/SelectInput/SelectInput';
import NotificationCard from '@/app/shared/components/NotificationCard/NotificationCard';

const recipientOptions = [
  { value: 'Student', label: 'Students' },
  { value: 'Admin', label: 'Administrators' },
];

const CreateNotificationForm = ({
  onSubmit,
}: {
  onSubmit: (message: string, role: string) => void;
}) => {
  const [message, setMessage] = useState('');
  const [recipientRole, setRecipientRole] = useState('all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSubmit(message.trim(), recipientRole);
      setMessage('');
    }
  };

  return (
    <section className={styles.createSection}>
      <form onSubmit={handleSubmit} className={styles.createForm}>
        <h2 className={styles.formTitle}>Create New Notification</h2>
        <FormGroup label="Send to:">
          <SelectInput
            value={recipientRole}
            onChange={setRecipientRole}
            options={recipientOptions}
            placeholder="Select recipient"
          />
        </FormGroup>
        <FormGroup label="Message:">
          <TextArea
            value={message}
            onChange={setMessage}
            placeholder="Enter notification message..."
            rows={3}
          />
        </FormGroup>
        <Button type="submit" disabled={!message.trim()}>
          Send Notification
        </Button>
      </form>
    </section>
  );
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get the current user from localStorage
  useEffect(() => {
    const userJson = localStorage.getItem('currentUser');

    if (!userJson) {
      setError("You're not logged in. Please log in to view notifications.");
      return;
    }

    try {
      const user = JSON.parse(userJson) as User;
      setCurrentUser(user);
    } catch (err) {
      setError('Invalid user data. Please log in again.');
      localStorage.removeItem('currentUser');
    }
  }, []);

  const isAdmin = currentUser?.role === 'Admin';
  const userId = currentUser?.user_id;
  const userRole = currentUser?.role;

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!userId || !userRole) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(
          `http://localhost:7071/api/notification?user_id=${userId}&user_role=${userRole}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch notifications');
        }

        const data = await response.json();
        setNotifications(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [userId, userRole]);

  const handleCreateNotification = async (
    message: string,
    recipientRole: string
  ) => {
    if (!currentUser) return;
    try {
      const response = await fetch(`http://localhost:7071/api/notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          recipient_role: recipientRole,
          message,
          created_by: currentUser?.user_id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send notification');
      }

      const newNotification = await response.json();
      if (
        newNotification.recipient_role === currentUser.role
      ) {
        setNotifications([newNotification, ...notifications]);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <span className={styles.bellIcon} aria-hidden="true" />
        <h1 className={styles.title}>
          {isAdmin ? 'System Notifications' : 'Your Notifications'}
        </h1>
        <p className={styles.subtitle}>
          {isAdmin
            ? 'Manage and send notifications to users'
            : 'Stay updated with your team activities and project deadlines'}
        </p>
      </header>

      {isAdmin && (
        <CreateNotificationForm onSubmit={handleCreateNotification} />
      )}

      <section className={styles.content}>
        <h2 className={styles.sectionTitle}>
          {isAdmin ? 'Sent Notifications' : 'Notifications'}
        </h2>
        {loading ? (
          <p className={styles.loadingState}>Loading notifications...</p>
        ) : notifications.length === 0 ? (
          <p className={styles.emptyState}>No notifications to display.</p>
        ) : (
          <ul className={styles.notificationsList}>
            {notifications.map((notification) => (
              <li key={notification.notification_id}>
                <NotificationCard {...notification} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
};

export default NotificationsPage;
