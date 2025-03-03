import React, { useState } from 'react';
import { SharedModal } from '@/app/shared/components/Modal/Modal';
import { Theme } from '@/app/shared/utils/types';
import styles from './ThemeModals.module.css';
import FormGroup from '@/app/shared/components/Form/FormGroup';
import TextInput from '@/app/shared/components/Form/TextInput';
import TextArea from '@/app/shared/components/Form/TextArea';

interface IdeaSubmission {
  idea_name: string;
  description: string;
}

interface ThemeModalsProps {
  theme: Theme;
  isOpen: boolean;
  onClose: () => void;
  modalType: 'view' | 'submit';
  onIdeaSubmit: (ideaSubmission: IdeaSubmission) => void;
}

const ThemeModals: React.FC<ThemeModalsProps> = ({
  theme,
  isOpen,
  onClose,
  modalType,
  onIdeaSubmit,
}) => {
  const [ideaSubmission, setIdeaSubmission] = useState<IdeaSubmission>({
    idea_name: '',
    description: '',
  });

  const formatDate = (dateString: string) => {
    const formattedDate = new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    return formattedDate;
  };

  const handleSubmitIdea = () => {
    onIdeaSubmit(ideaSubmission);
    onClose();
  };

  const ThemeDetails = () => (
    <section className={styles.detailsSection}>
      <p className={styles.themeDescription}>{theme.description}</p>
  
      <dl>
        <div className={styles.infoRow}>
          <dt className={styles.infoLabel}>Submission Deadline:</dt>
          <dd className={styles.infoValue}>
            {formatDate(theme.submission_deadline)}
          </dd>
        </div>
  
        <div className={styles.infoRow}>
          <dt className={styles.infoLabel}>Voting Deadline:</dt>
          <dd className={styles.infoValue}>
            {formatDate(theme.voting_deadline)}
          </dd>
        </div>
  
        <div className={styles.infoRow}>
          <dt className={styles.infoLabel}>Review Period:</dt>
          <dd className={styles.infoValue}>
            {theme.review_deadline && theme.review_deadline.length > 0
              ? `${formatDate(theme.review_deadline[0].start)} - ${formatDate(theme.review_deadline[0].end)}`
              : 'Not specified'}
          </dd>
        </div>
  
        <div className={styles.infoRow}>
          <dt className={styles.infoLabel}>Number of Groups:</dt>
          <dd className={styles.infoValue}>{theme.number_of_groups}</dd>
        </div>
      </dl>
    </section>
  );

  const IdeaSubmissionForm = () => (
    <form
      id="modalForm"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmitIdea();
      }}
      className={styles.submissionForm}
    >
      <p className={styles.themeDescription}>
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
      {modalType === 'view' ? <ThemeDetails /> : <IdeaSubmissionForm />}
    </SharedModal>
  );
};

export default ThemeModals;