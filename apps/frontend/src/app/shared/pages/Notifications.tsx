import React, { useState, useEffect } from 'react';
import styles from './Notifications.module.css';
import { User, Notification } from '@/app/shared/utils/types';
import Button from '@/app/shared/components/Button/Button';
import FormGroup from '@/app/shared/components/Form/FormGroup';
import TextArea from '@/app/shared/components/Form/TextArea';
import SelectInput from '@/app/shared/components/SelectInput/SelectInput';
import NotificationCard from '@/app/shared/components/NotificationCard/NotificationCard';

const recipientOptions = [
  { value: 'all', label: 'All Users' },
  { value: 'student', label: 'Students' },
  { value: 'team_lead', label: 'Team Leads' },
  { value: 'admin', label: 'Administrators' },
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
  const [currentUser] = useState<User>({
    user_id: 1,
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    created_at: '12:00:00',
    updated_at: null,
  });

  const isAdmin = currentUser.role === 'admin';

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const mockNotifications: Notification[] = [
          {
            notification_id: 1,
            recipient_role: 'all',
            message: "New theme 'Web Development' has been created",
            created_by: 2,
            created_at: new Date().toISOString(),
            status: 'info',
          },
          {
            notification_id: 2,
            recipient_role: 'student',
            message: 'Deadline for idea submission is approaching',
            created_by: 2,
            created_at: new Date(Date.now() - 86400000).toISOString(),
            status: 'warning',
          },
          {
            notification_id: 3,
            recipient_role: 'team_lead',
            message: 'New review submitted for your group',
            created_by: 2,
            created_at: new Date(Date.now() - 172800000).toISOString(),
            status: 'success',
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
  }, []);

  const handleCreateNotification = (message: string, recipientRole: string) => {
    const newNotification: Notification = {
      notification_id: Date.now(),
      recipient_role: recipientRole,
      message,
      created_by: currentUser.user_id,
      created_at: new Date().toISOString(),
      status: 'info',
    };

    setNotifications([newNotification, ...notifications]);
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
