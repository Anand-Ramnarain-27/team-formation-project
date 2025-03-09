import React, { useState, useEffect } from 'react';
import styles from './ThemeModals.module.css';
import { Theme, BaseTheme, ReviewDeadline, Question, BaseThemeWithQuestions, ThemeWithQuestions } from '@/app/shared/utils/types';
import { SharedModal } from '@/app/shared/components/Modal/Modal';
import Button from '@/app/shared/components/Button/Button';
import buttonStyles from '@/app/shared/components/Button/Button.module.css';
import FormGroup from '@/app/shared/components/Form/FormGroup';
import TextInput from '@/app/shared/components/Form/TextInput';
import TextArea from '@/app/shared/components/Form/TextArea';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: ThemeWithQuestions;
  onSubmit: (theme: BaseThemeWithQuestions) => void;
}

interface DeadlineInputsProps {
  deadline: ReviewDeadline;
  onUpdate: (field: 'start' | 'end', value: string) => void;
}

const formatDateForInput = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) return '';
    
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
  const initialTheme: BaseThemeWithQuestions = {
    title: '',
    description: '',
    submission_deadline: '',
    voting_deadline: '',
    review_deadline: [{ start: '', end: '' }],
    number_of_groups: 1,
    auto_assign_group: false,
    questions: [{ question_text: '' }]
  };

  const [formData, setFormData] = useState<BaseThemeWithQuestions>(initialTheme);
  const [activeTab, setActiveTab] = useState<'general' | 'questions'>('general');

  useEffect(() => {
    if (theme) {
      const { theme_id, ...baseTheme } = theme;

      let reviewDeadlines;
      
      try {
        if (Array.isArray(baseTheme.review_deadline)) {
          reviewDeadlines = baseTheme.review_deadline.map(deadline => ({
            start: formatDateForInput(deadline.start),
            end: formatDateForInput(deadline.end)
          }));
        } 
        else if (typeof baseTheme.review_deadline === 'string') {
          const parsedDeadlines = JSON.parse(baseTheme.review_deadline);
          reviewDeadlines = Array.isArray(parsedDeadlines) 
            ? parsedDeadlines.map(deadline => ({
                start: formatDateForInput(deadline.start),
                end: formatDateForInput(deadline.end)
              }))
            : [{ start: '', end: '' }];
        } 
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
        review_deadline: reviewDeadlines,
        questions: theme.questions || [{ question_text: '' }]
      };
      
      console.log("Formatted theme for form:", formattedTheme);
      setFormData(formattedTheme);
    } else {
      setFormData(initialTheme);
    }
  }, [theme, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formattedData = {
      ...formData,
      submission_deadline: formData.submission_deadline ? new Date(formData.submission_deadline).toISOString() : '',
      voting_deadline: formData.voting_deadline ? new Date(formData.voting_deadline).toISOString() : '',
      review_deadline: formData.review_deadline.map(deadline => ({
        start: deadline.start ? new Date(deadline.start).toISOString() : '',
        end: deadline.end ? new Date(deadline.end).toISOString() : ''
      })),
      questions: formData.questions.filter(q => q.question_text.trim() !== '')
    };

    const validReviewDeadlines = formattedData.review_deadline.filter(
      deadline => deadline.start && deadline.end
    );

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

  const addQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      questions: [...prev.questions, { question_text: '' }]
    }));
  };

  const removeQuestion = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const updateQuestion = (index: number, questionText: string) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === index ? { ...q, question_text: questionText } : q
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
      <div className={styles.tabHeader}>
        <button 
          className={`${styles.tabButton} ${activeTab === 'general' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('general')}
        >
          General Information
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'questions' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('questions')}
        >
          Review Questions
        </button>
      </div>

      <form
        id="themeForm"
        onSubmit={handleSubmit}
        className={styles.form}
        aria-label="Theme configuration form"
      >
        {activeTab === 'general' && (
          <div className={styles.tabContent}>
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
                value={formData.description || ''}
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
          </div>
        )}

        {activeTab === 'questions' && (
          <div className={styles.tabContent}>
            <header className={styles.questionsHeader}>
              <h3>Review Questions</h3>
              <p className={styles.questionInfo}>
                Add questions that students will answer when reviewing their peers. 
                These questions will be rated on a scale of 1-5.
              </p>
            </header>
            
            {formData.questions.map((question, index) => (
              <div key={index} className={styles.questionItem}>
                <FormGroup label={`Question ${index + 1}`}>
                  <div className={styles.questionInputRow}>
                    <TextArea
                      value={question.question_text}
                      onChange={(value) => updateQuestion(index, value)}
                      placeholder="Enter review question"
                      rows={2}
                      aria-label={`Review question ${index + 1}`}
                    />
                    {formData.questions.length > 1 && (
                      <Button
                        onClick={() => removeQuestion(index)}
                        className={buttonStyles.danger}
                        aria-label={`Remove question ${index + 1}`}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </FormGroup>
              </div>
            ))}
            
            <Button
              onClick={addQuestion}
              aria-label="Add new question"
              className={styles.addQuestionBtn}
            >
              + Add Question
            </Button>
          </div>
        )}
      </form>
    </SharedModal>
  );
};