import React, { useState, useEffect } from 'react';
import styles from './ThemeModals.module.css';
import { Theme, BaseTheme } from '@/app/shared/utils/types';
import { SharedModal } from '@/app/shared/components/Modal/Modal';
import Button from '@/app/shared/components/Button/Button';
import style from '@/app/shared/components/Button/Button.module.css';
import FormGroup from '@/app/shared/components/Form/FormGroup'; 
import TextInput from '@/app/shared/components/Form/TextInput';
import TextArea from '@/app/shared/components/Form/TextArea';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: Theme;
  onSubmit: (theme: BaseTheme) => void;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({
  isOpen,
  onClose,
  theme,
  onSubmit,
}) => {
  const initialTheme: BaseTheme = {
    title: '',
    description: '',
    submission_deadline: '',
    voting_deadline: '',
    review_deadline: [{ start: '', end: '' }],
    number_of_groups: 1,
    auto_assign_group: false,
  };

  const [formData, setFormData] = useState<BaseTheme>(initialTheme);

  useEffect(() => {
    if (theme) {
      const { theme_id, ...baseTheme } = theme;
      setFormData(baseTheme);
    } else {
      setFormData(initialTheme);
    }
  }, [theme, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  const addReviewDeadline = () => {
    setFormData(prev => ({
      ...prev,
      review_deadline: [...prev.review_deadline, { start: '', end: '' }]
    }));
  };

  const removeReviewDeadline = (index: number) => {
    setFormData(prev => ({
      ...prev,
      review_deadline: prev.review_deadline.filter((_, i) => i !== index)
    }));
  };

  const updateReviewDeadline = (index: number, field: 'start' | 'end', value: string) => {
    setFormData(prev => ({
      ...prev,
      review_deadline: prev.review_deadline.map((deadline, i) => 
        i === index ? { ...deadline, [field]: value } : deadline
      )
    }));
  };

  return (
    <SharedModal
      isOpen={isOpen}
      onClose={onClose}
      title={theme ? 'Edit Theme' : 'Create New Theme'}
      size="medium"
      showFooter={true}
      footerContent={
        <>
          <Button onClick={onClose} className={style.third}>
            Cancel
          </Button>
          <button type="submit" form="modalForm" className={styles.submitButton}>
            {theme ? 'Save Changes' : 'Create Theme'}
          </button>
        </>
      }
    >
      <form id="modalForm" onSubmit={handleSubmit} className={styles.form}>
        <FormGroup label="Title">
          <TextInput
            value={formData.title}
            onChange={(value) => setFormData(prev => ({ ...prev, title: value }))}
            placeholder="Enter theme title"
          />
        </FormGroup>

        <FormGroup label="Description">
          <TextArea
            value={formData.description}
            onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
            placeholder="Enter theme description"
            rows={4}
          />
        </FormGroup>

        <div className={styles.formRow}>
          <FormGroup label="Submission Deadline">
            <TextInput
              type="datetime-local"
              value={formData.submission_deadline}
              onChange={(value) => setFormData(prev => ({ ...prev, submission_deadline: value }))}
            />
          </FormGroup>

          <FormGroup label="Voting Deadline">
            <TextInput
              type="datetime-local"
              value={formData.voting_deadline}
              onChange={(value) => setFormData(prev => ({ ...prev, voting_deadline: value }))}
            />
          </FormGroup>
        </div>

        <FormGroup label="Review Deadlines">
          {formData.review_deadline.map((deadline, index) => (
            <div key={index} className={styles.reviewDeadlineRow}>
              <div className={styles.reviewDeadlineInputs}>
                <TextInput
                  type="datetime-local"
                  value={deadline.start}
                  onChange={(value) => updateReviewDeadline(index, 'start', value)}
                  placeholder="Start Date"
                />
                <TextInput
                  type="datetime-local"
                  value={deadline.end}
                  onChange={(value) => updateReviewDeadline(index, 'end', value)}
                  placeholder="End Date"
                />
              </div>
              {formData.review_deadline.length > 1 && (
                <Button
                  onClick={() => removeReviewDeadline(index)}
                  className={style.danger}
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
          <Button onClick={addReviewDeadline}>
            + Add Review Period
          </Button>
        </FormGroup>

        <div className={styles.formRow}>
          <FormGroup label="Number of Groups">
            <TextInput
              type="number"
              value={formData.number_of_groups.toString()}
              onChange={(value) => setFormData(prev => ({ ...prev, number_of_groups: parseInt(value) || 1 }))}
            />
          </FormGroup>

          <FormGroup label="Auto-assign Groups">
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.auto_assign_group}
                onChange={(e) => setFormData(prev => ({ ...prev, auto_assign_group: e.target.checked }))}
              />
            </label>
          </FormGroup>
        </div>
      </form>
    </SharedModal>
  );
};