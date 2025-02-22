import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './Notifications.module.css';
import { User, Notification } from '@/app/shared/utils/types';
import Button from '@/app/shared/components/Button/Button';
import FormGroup from '@/app/shared/components/Form/FormGroup';
import TextArea from '@/app/shared/components/Form/TextArea';
import SelectInput from '@/app/shared/components/SelectInput/SelectInput';
import NotificationCard from '@/app/shared/components/NotificationCard/NotificationCard';
import {
  LoadingState,
  EmptyState,
} from '@/app/shared/components/States/States';

const CreateNotification = ({
  onNotificationCreate,
  currentUser,
}: {
  onNotificationCreate: (
    notification: Omit<Notification, 'notification_id' | 'created_at'>
  ) => void;
  currentUser: User;
}) => {
  const [message, setMessage] = useState('');
  const [recipientRole, setRecipientRole] = useState('all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onNotificationCreate({
        recipient_role: recipientRole,
        message: message.trim(),
        created_by: currentUser.user_id,
      });
      setMessage('');
    }
  };

  const recipientOptions = [
    { value: 'all', label: 'All Users' },
    { value: 'student', label: 'Students' },
    { value: 'team_lead', label: 'Team Leads' },
    { value: 'admin', label: 'Administrators' },
  ];

  return (
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
      <Button
        type="submit"
        disabled={!message.trim()}
        className={styles.submitButton}
      >
        Send Notification
      </Button>
    </form>
  );
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User>({
    user_id: 1,
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    created_at: '12:00:00',
    updated_at: null,
  });

  const location = useLocation();
  const isAdmin = currentUser.role === 'admin';

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // In a real implementation, this would be an API call to your database
        // Example SQL query for reference:
        /*
        SELECT n.*, u.name as creator_name, u.email as creator_email
        FROM notifications n
        LEFT JOIN users u ON n.created_by = u.user_id
        WHERE n.recipient_role = $1 OR n.recipient_role = 'all'
        ORDER BY n.created_at DESC
        */

        const mockUser: User = {
          user_id: 2,
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'admin',
          created_at: '12:00:00',
          updated_at: null,
        };

        const mockNotifications: Notification[] = [
          {
            notification_id: 1,
            recipient_role: 'all',
            message: "New theme 'Web Development' has been created",
            created_by: 2,
            created_at: new Date().toISOString(),
            creator: mockUser,
            status: 'info', // Add status to match NotificationCardProps
          },
          {
            notification_id: 2,
            recipient_role: 'student',
            message: 'Deadline for idea submission is approaching',
            created_by: 2,
            created_at: new Date(Date.now() - 86400000).toISOString(),
            creator: mockUser,
            status: 'warning', // Add status to match NotificationCardProps
          },
          {
            notification_id: 3,
            recipient_role: 'team_lead',
            message: 'New review submitted for your group',
            created_by: 2,
            created_at: new Date(Date.now() - 172800000).toISOString(),
            creator: mockUser,
            status: 'success', // Add status to match NotificationCardProps
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
  }, [currentUser.role]);

  const handleCreateNotification = async (
    newNotification: Omit<Notification, 'notification_id' | 'created_at'>
  ) => {
    try {
      // In a real implementation, this would be an API call to your database
      // Example SQL query for reference:
      /*
      INSERT INTO notifications (recipient_role, message, created_by)
      VALUES ($1, $2, $3)
      RETURNING notification_id, created_at;
      */

      const createdNotification: Notification = {
        notification_id: Date.now(),
        ...newNotification,
        created_at: new Date().toISOString(),
        creator: currentUser,
        status: 'info', // Default status for new notifications
      };

      setNotifications([createdNotification, ...notifications]);
    } catch (error) {
      console.error('Error creating notification:', error);
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
          <CreateNotification
            onNotificationCreate={handleCreateNotification}
            currentUser={currentUser}
          />
        </div>
      )}

      <div className={styles.content}>
        <h2 className={styles.sectionTitle}>
          {isAdmin ? 'Sent Notifications' : 'Notifications'}
        </h2>
        {loading ? (
          <LoadingState message="Loading notifications..." />
        ) : notifications.length === 0 ? (
          <EmptyState
            title="No notifications"
            description="There are no notifications to display at this time."
          />
        ) : (
          <div className={styles.notificationsList}>
            {notifications.map((notification) => (
              <NotificationCard
                key={notification.notification_id}
                message={notification.message}
                created_at={notification.created_at}
                status={notification.status}
                notification_id={notification.notification_id}
                recipient_role={notification.recipient_role}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
