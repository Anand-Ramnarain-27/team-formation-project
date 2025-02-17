// ThemeModals.tsx
import React, { useState } from 'react';
import styles from './ThemeModals.module.css';

// Define the Theme interface
export interface Theme {
  theme_id: number;
  title: string;
  description: string;
  submission_deadline: string;
  voting_deadline: string;
  review_deadline: {
    start: string;
    end: string;
  };
  number_of_groups: number;
  color_index: number;
}

// Define and export the props interface
export interface ThemeModalsProps {
  theme: Theme;
  isOpen: boolean;
  onClose: () => void;
  modalType: 'view' | 'submit';
}

const ThemeModals: React.FC<ThemeModalsProps> = ({
  theme,
  isOpen,
  onClose,
  modalType,
}) => {
  const [ideaSubmission, setIdeaSubmission] = useState({
    idea_name: '',
    description: '',
  });

  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSubmitIdea = () => {
    // Here you would integrate with your API to submit the idea
    const newIdea = {
      theme_id: theme.theme_id,
      idea_name: ideaSubmission.idea_name,
      description: ideaSubmission.description,
      status: 'Pending',
    };
    console.log('Submitting idea:', newIdea);
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const renderThemeDetails = () => (
    <>
      <div className={styles.modalHeader}>
        <h2 className={styles.modalTitle}>{theme.title}</h2>
        <p className={styles.modalDescription}>{theme.description}</p>
      </div>
      <div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Submission Deadline:</span>
          <span className={styles.infoValue}>
            {formatDate(theme.submission_deadline)}
          </span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Voting Deadline:</span>
          <span className={styles.infoValue}>
            {formatDate(theme.voting_deadline)}
          </span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Review Period:</span>
          <span className={styles.infoValue}>
            {formatDate(theme.review_deadline.start)} -{' '}
            {formatDate(theme.review_deadline.end)}
          </span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Number of Groups:</span>
          <span className={styles.infoValue}>{theme.number_of_groups}</span>
        </div>
      </div>
    </>
  );

  const renderIdeaSubmission = () => (
    <>
      <div className={styles.modalHeader}>
        <h2 className={styles.modalTitle}>Submit New Idea</h2>
        <p className={styles.modalDescription}>
          Submit your idea for the theme: {theme.title}
        </p>
      </div>
      <form onSubmit={(e) => e.preventDefault()}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Idea Name</label>
          <input
            type="text"
            className={styles.input}
            value={ideaSubmission.idea_name}
            onChange={(e) =>
              setIdeaSubmission((prev) => ({
                ...prev,
                idea_name: e.target.value,
              }))
            }
            placeholder="Enter your idea name"
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Description</label>
          <textarea
            className={styles.textarea}
            value={ideaSubmission.description}
            onChange={(e) =>
              setIdeaSubmission((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            placeholder="Describe your idea in detail"
            rows={5}
          />
        </div>
        <div className={styles.buttonGroup}>
          <button
            type="button"
            className={`${styles.button} ${styles.secondaryButton}`}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className={`${styles.button} ${styles.primaryButton}`}
            onClick={handleSubmitIdea}
            disabled={!ideaSubmission.idea_name || !ideaSubmission.description}
          >
            Submit Idea
          </button>
        </div>
      </form>
    </>
  );

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
        {modalType === 'view' ? renderThemeDetails() : renderIdeaSubmission()}
      </div>
    </div>
  );
};

export default ThemeModals;
