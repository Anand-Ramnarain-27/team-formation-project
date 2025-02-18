import React, { useState, useEffect } from 'react';
import styles from './ThemeModals.module.css';
import { Theme, BaseTheme, ReviewDeadline } from '../types/types';

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

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>{theme ? 'Edit Theme' : 'Create New Theme'}</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="submission_deadline">Submission Deadline</label>
              <input
                type="datetime-local"
                id="submission_deadline"
                value={formData.submission_deadline}
                onChange={(e) => setFormData(prev => ({ ...prev, submission_deadline: e.target.value }))}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="voting_deadline">Voting Deadline</label>
              <input
                type="datetime-local"
                id="voting_deadline"
                value={formData.voting_deadline}
                onChange={(e) => setFormData(prev => ({ ...prev, voting_deadline: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Review Deadlines</label>
            {formData.review_deadline.map((deadline, index) => (
              <div key={index} className={styles.reviewDeadlineRow}>
                <div className={styles.reviewDeadlineInputs}>
                  <input
                    type="datetime-local"
                    value={deadline.start}
                    onChange={(e) => updateReviewDeadline(index, 'start', e.target.value)}
                    placeholder="Start Date"
                    required
                  />
                  <input
                    type="datetime-local"
                    value={deadline.end}
                    onChange={(e) => updateReviewDeadline(index, 'end', e.target.value)}
                    placeholder="End Date"
                    required
                  />
                </div>
                {formData.review_deadline.length > 1 && (
                  <button
                    type="button"
                    className={styles.removeButton}
                    onClick={() => removeReviewDeadline(index)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className={styles.addButton}
              onClick={addReviewDeadline}
            >
              + Add Review Period
            </button>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="number_of_groups">Number of Groups</label>
              <input
                type="number"
                id="number_of_groups"
                min="1"
                value={formData.number_of_groups}
                onChange={(e) => setFormData(prev => ({ ...prev, number_of_groups: parseInt(e.target.value) }))}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.auto_assign_group}
                  onChange={(e) => setFormData(prev => ({ ...prev, auto_assign_group: e.target.checked }))}
                />
                Auto-assign Groups
              </label>
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.submitButton}>
              {theme ? 'Save Changes' : 'Create Theme'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};