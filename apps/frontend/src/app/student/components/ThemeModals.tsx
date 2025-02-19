import React, { useState } from 'react';
import { SharedModal } from '@/app/shared/components/Modal/Modal';
import { Theme } from '@/app/shared/utils/types';
import styles from './ThemeModals.module.css';
import FormGroup from '@/app/shared/components/Form/FormGroup';
import TextInput from '@/app/shared/components/Form/TextInput';
import TextArea from '@/app/shared/components/Form/TextArea';

interface IdeaSubmissionForm {
  idea_name: string;
  description: string;
}

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
  const [ideaSubmission, setIdeaSubmission] = useState<IdeaSubmissionForm>({
    idea_name: '',
    description: '',
  });

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
    const newIdea = {
      theme_id: theme.theme_id,
      idea_name: ideaSubmission.idea_name,
      description: ideaSubmission.description,
      status: 'Pending' as const,
    };
    console.log('Submitting idea:', newIdea);
    onClose();
  };

  const renderThemeDetails = () => (
    <>
      <div>
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
            {formatDate(theme.review_deadline[0].start)} -{' '}
            {formatDate(theme.review_deadline[0].end)}
          </span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Number of Groups:</span>
          <span className={styles.infoValue}>{theme.number_of_groups}</span>
        </div>
      </div>
    </>
  );

  // Rest of the component remains the same
  const renderIdeaSubmission = () => (
    <form id="modalForm" onSubmit={(e) => e.preventDefault()}>
      <p className={styles.modalDescription}>
        Submit your idea for the theme: {theme.title}
      </p>

      <FormGroup label="Idea Name">
        <TextInput
          value={ideaSubmission.idea_name}
          onChange={(value) =>
            setIdeaSubmission((prev) => ({
              ...prev,
              idea_name: value,
            }))
          }
          placeholder="Enter your idea name"
        />
      </FormGroup>

      <FormGroup label="Description">
        <TextArea
          value={ideaSubmission.description}
          onChange={(value) =>
            setIdeaSubmission((prev) => ({
              ...prev,
              description: value,
            }))
          }
          placeholder="Describe your idea in detail"
          rows={5}
        />
      </FormGroup>
    </form>
  );

  return (
    <SharedModal
      isOpen={isOpen}
      onClose={onClose}
      title={modalType === 'view' ? theme.title : 'Submit New Idea'}
      showFooter={modalType === 'submit'}
      size="medium"
    >
      {modalType === 'view' ? renderThemeDetails() : renderIdeaSubmission()}
    </SharedModal>
  );
};

export default ThemeModals;
