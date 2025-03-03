import React, { useState, useEffect } from 'react';
import styles from './ThemeModals.module.css';
import { Theme, BaseTheme, ReviewDeadline } from '@/app/shared/utils/types';
import { SharedModal } from '@/app/shared/components/Modal/Modal';
import Button from '@/app/shared/components/Button/Button';
import buttonStyles from '@/app/shared/components/Button/Button.module.css';
import FormGroup from '@/app/shared/components/Form/FormGroup';
import TextInput from '@/app/shared/components/Form/TextInput';
import TextArea from '@/app/shared/components/Form/TextArea';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: Theme;
  onSubmit: (theme: BaseTheme) => void;
}

interface DeadlineInputsProps {
  deadline: ReviewDeadline;
  onUpdate: (field: 'start' | 'end', value: string) => void;
}

const formatDateForInput = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    // Create a Date object from the string
    const date = new Date(dateString);
    
    // Check if it's a valid date
    if (isNaN(date.getTime())) return '';
    
    // Format to YYYY-MM-DDTHH:MM
    return date.toISOString().substring(0, 16);
  } catch (error) {
    console.error("Error formatting date:", error);
    return '';
  }
};

const DeadlineInputs: React.FC<DeadlineInputsProps> = ({
  deadline,
  onUpdate,
}) => (
  <fieldset className={styles.reviewDeadlineInputs}>
    <TextInput
      type="datetime-local"
      value={formatDateForInput(deadline.start)}
      onChange={(value) => onUpdate('start', value)}
      placeholder="Start Date"
      aria-label="Review period start date"
    />
    <TextInput
      type="datetime-local"
      value={formatDateForInput(deadline.end)}
      onChange={(value) => onUpdate('end', value)}
      placeholder="End Date"
      aria-label="Review period end date"
    />
  </fieldset>
);

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
      
      // Process the review_deadline data
      let reviewDeadlines;
      
      try {
        // First check if it's already an array
        if (Array.isArray(baseTheme.review_deadline)) {
          reviewDeadlines = baseTheme.review_deadline.map(deadline => ({
            start: formatDateForInput(deadline.start),
            end: formatDateForInput(deadline.end)
          }));
        } 
        // Check if it's a string that needs parsing
        else if (typeof baseTheme.review_deadline === 'string') {
          const parsedDeadlines = JSON.parse(baseTheme.review_deadline);
          reviewDeadlines = Array.isArray(parsedDeadlines) 
            ? parsedDeadlines.map(deadline => ({
                start: formatDateForInput(deadline.start),
                end: formatDateForInput(deadline.end)
              }))
            : [{ start: '', end: '' }];
        } 
        // Default case
        else {
          reviewDeadlines = [{ start: '', end: '' }];
        }
      } catch (error) {
        console.error("Error parsing review_deadline:", error);
        reviewDeadlines = [{ start: '', end: '' }];
      }
  
      const formattedTheme = {
        ...baseTheme,
        submission_deadline: formatDateForInput(baseTheme.submission_deadline.toString()),
        voting_deadline: formatDateForInput(baseTheme.voting_deadline.toString()),
        review_deadline: reviewDeadlines
      };
      
      console.log("Formatted theme for form:", formattedTheme);
      setFormData(formattedTheme);
    } else {
      setFormData(initialTheme);
    }
  }, [theme, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Format dates correctly for the backend
    const formattedData = {
      ...formData,
      submission_deadline: formData.submission_deadline ? new Date(formData.submission_deadline).toISOString() : '',
      voting_deadline: formData.voting_deadline ? new Date(formData.voting_deadline).toISOString() : '',
      review_deadline: formData.review_deadline.map(deadline => ({
        start: deadline.start ? new Date(deadline.start).toISOString() : '',
        end: deadline.end ? new Date(deadline.end).toISOString() : ''
      }))
    };
    
    // Filter out any review deadlines with empty dates
    const validReviewDeadlines = formattedData.review_deadline.filter(
      deadline => deadline.start && deadline.end
    );
    
    // Only submit if we have valid review deadlines
    if (validReviewDeadlines.length === 0) {
      alert('Please add at least one valid review deadline with start and end dates');
      return;
    }
    
    formattedData.review_deadline = validReviewDeadlines;
    onSubmit(formattedData);
    onClose();
  };

  const addReviewDeadline = () => {
    setFormData((prev) => ({
      ...prev,
      review_deadline: [...prev.review_deadline, { start: '', end: '' }],
    }));
  };

  const removeReviewDeadline = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      review_deadline: prev.review_deadline.filter((_, i) => i !== index),
    }));
  };

  const updateReviewDeadline = (
    index: number,
    field: 'start' | 'end',
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      review_deadline: prev.review_deadline.map((deadline, i) =>
        i === index ? { ...deadline, [field]: value } : deadline
      ),
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
        <nav className={styles.modalActions}>
          <Button onClick={onClose} className={buttonStyles.third}>
            Cancel
          </Button>
          <button
            type="submit"
            form="themeForm"
            className={styles.submitButton}
            aria-label={theme ? 'Save theme changes' : 'Create new theme'}
          >
            {theme ? 'Save Changes' : 'Create Theme'}
          </button>
        </nav>
      }
    >
      <form
        id="themeForm"
        onSubmit={handleSubmit}
        className={styles.form}
        aria-label="Theme configuration form"
      >
        <FormGroup label="Title">
          <TextInput
            value={formData.title}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, title: value }))
            }
            placeholder="Enter theme title"
            aria-label="Theme title"
          />
        </FormGroup>

        <FormGroup label="Description">
          <TextArea
            value={formData.description}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, description: value }))
            }
            placeholder="Enter theme description"
            rows={4}
            aria-label="Theme description"
          />
        </FormGroup>

        <section className={styles.formRow}>
          <FormGroup label="Submission Deadline">
            <TextInput
              type="datetime-local"
              value={formData.submission_deadline}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, submission_deadline: value }))
              }
              aria-label="Submission deadline"
            />
          </FormGroup>

          <FormGroup label="Voting Deadline">
            <TextInput
              type="datetime-local"
              value={formData.voting_deadline}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, voting_deadline: value }))
              }
              aria-label="Voting deadline"
            />
          </FormGroup>
        </section>

        <FormGroup label="Review Deadlines">
          {formData.review_deadline.map((deadline, index) => (
            <article key={index} className={styles.reviewDeadlineRow}>
              <DeadlineInputs
                deadline={deadline}
                onUpdate={(field, value) =>
                  updateReviewDeadline(index, field, value)
                }
              />
              {formData.review_deadline.length > 1 && (
                <Button
                  onClick={() => removeReviewDeadline(index)}
                  className={buttonStyles.danger}
                  aria-label={`Remove review period ${index + 1}`}
                >
                  Remove
                </Button>
              )}
            </article>
          ))}
          <Button
            onClick={addReviewDeadline}
            aria-label="Add new review period"
          >
            + Add Review Period
          </Button>
        </FormGroup>

        <section className={styles.formRow}>
          <FormGroup label="Number of Groups">
            <TextInput
              type="number"
              value={formData.number_of_groups.toString()}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  number_of_groups: parseInt(value) || 1,
                }))
              }
              aria-label="Number of groups"
            />
          </FormGroup>

          <FormGroup label="Auto-assign Groups">
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.auto_assign_group}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    auto_assign_group: e.target.checked,
                  }))
                }
                aria-label="Enable auto-assign groups"
              />
              <span className={styles.checkboxText}></span>
            </label>
          </FormGroup>
        </section>
      </form>
    </SharedModal>
  );
};