import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './Notifications.module.css';

// TypeScript interfaces matching the database schema
interface User {
  user_id: number;
  name: string;
  email: string;
  role: string;
}

interface Notification {
  notification_id: number;
  recipient_role: string;
  message: string;
  created_by: number;
  created_at: string;
  creator?: User; // Joined from users table
}

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
            {notification.creator && ` • Sent by ${notification.creator.name}`}
          </p>
        </div>
      </div>
    </div>
  );
};

const CreateNotification = ({
  onNotificationCreate,
  currentUser,
}: {
  onNotificationCreate: (notification: Omit<Notification, 'notification_id' | 'created_at'>) => void;
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
        created_by: currentUser.user_id
      });
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
          <option value="student">Students</option>
          <option value="team_lead">Team Leads</option>
          <option value="admin">Administrators</option>
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
      <button 
        type="submit" 
        className={styles.submitButton}
        disabled={!message.trim()}
      >
        Send Notification
      </button>
    </form>
  );
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User>({
    user_id: 1,
    name: "Admin User",
    email: "admin@example.com",
    role: "admin"
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
          name: "Jane Smith",
          email: "jane@example.com",
          role: "admin"
        };

        const mockNotifications: Notification[] = [
          {
            notification_id: 1,
            recipient_role: "all",
            message: "New theme 'Web Development' has been created",
            created_by: 2,
            created_at: new Date().toISOString(),
            creator: mockUser
          },
          {
            notification_id: 2,
            recipient_role: "student",
            message: "Deadline for idea submission is approaching",
            created_by: 2,
            created_at: new Date(Date.now() - 86400000).toISOString(),
            creator: mockUser
          },
          {
            notification_id: 3,
            recipient_role: "team_lead",
            message: "New review submitted for your group",
            created_by: 2,
            created_at: new Date(Date.now() - 172800000).toISOString(),
            creator: mockUser
          }
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

  const handleCreateNotification = async (newNotification: Omit<Notification, 'notification_id' | 'created_at'>) => {
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
        creator: currentUser
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