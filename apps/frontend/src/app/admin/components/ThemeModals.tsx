import React, { useState } from 'react';
import styles from './ThemeModals.module.css';

interface Theme {
  theme_id: number;
  title: string;
  description: string;
  submission_deadline: string;
  voting_deadline: string;
  review_deadline: { start: string; end: string }[];
  number_of_groups: number;
  auto_assign_group: boolean;
}

interface ThemeModalsProps {
  onThemeCreate: (theme: Omit<Theme, 'theme_id'>) => void;
  onThemeUpdate: (theme: Theme) => void;
}

const ThemeModals: React.FC<ThemeModalsProps> = ({
  onThemeCreate,
  onThemeUpdate,
}) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [reviewDates, setReviewDates] = useState([{ start: '', end: '' }]);

  const [newTheme, setNewTheme] = useState({
    title: '',
    description: '',
    submission_deadline: '',
    voting_deadline: '',
    number_of_groups: 1,
    auto_assign_group: true,
  });

  const handleCreateTheme = async (e: React.FormEvent) => {
    e.preventDefault();
    const themeData = {
      ...newTheme,
      review_deadline: reviewDates,
    };

    onThemeCreate(themeData);
    setIsCreateOpen(false);
    resetForm();
  };

  const handleManageTheme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTheme) {
      onThemeUpdate(selectedTheme);
      setIsManageOpen(false);
    }
  };

  const addReviewPeriod = () => {
    setReviewDates([...reviewDates, { start: '', end: '' }]);
  };

  const removeReviewPeriod = (index: number) => {
    setReviewDates(reviewDates.filter((_, i) => i !== index));
  };

  const updateReviewDate = (
    index: number,
    field: 'start' | 'end',
    value: string
  ) => {
    const updatedDates = [...reviewDates];
    updatedDates[index][field] = value;
    setReviewDates(updatedDates);
  };

  const resetForm = () => {
    setNewTheme({
      title: '',
      description: '',
      submission_deadline: '',
      voting_deadline: '',
      number_of_groups: 1,
      auto_assign_group: true,
    });
    setReviewDates([{ start: '', end: '' }]);
  };

  return (
    <>
      <button
        className={styles.createThemeButton}
        onClick={() => setIsCreateOpen(true)}
      >
        + Create New Theme
      </button>

      {/* Create Theme Modal */}
      {isCreateOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Create New Theme</h2>
              <button
                className={styles.closeButton}
                onClick={() => setIsCreateOpen(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateTheme} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Theme Title</label>
                <input
                  className={styles.input}
                  value={newTheme.title}
                  onChange={(e) =>
                    setNewTheme({ ...newTheme, title: e.target.value })
                  }
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Description</label>
                <textarea
                  className={styles.textarea}
                  value={newTheme.description}
                  onChange={(e) =>
                    setNewTheme({ ...newTheme, description: e.target.value })
                  }
                  required
                />
              </div>

              <div className={styles.dateGroup}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Submission Deadline</label>
                  <input
                    className={styles.input}
                    type="datetime-local"
                    value={newTheme.submission_deadline}
                    onChange={(e) =>
                      setNewTheme({
                        ...newTheme,
                        submission_deadline: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Voting Deadline</label>
                  <input
                    className={styles.input}
                    type="datetime-local"
                    value={newTheme.voting_deadline}
                    onChange={(e) =>
                      setNewTheme({
                        ...newTheme,
                        voting_deadline: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Review Periods</label>
                {reviewDates.map((period, index) => (
                  <div key={index} className={styles.reviewPeriod}>
                    <div className={styles.reviewDates}>
                      <input
                        className={styles.input}
                        type="datetime-local"
                        value={period.start}
                        onChange={(e) =>
                          updateReviewDate(index, 'start', e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className={styles.reviewDates}>
                      <input
                        className={styles.input}
                        type="datetime-local"
                        value={period.end}
                        onChange={(e) =>
                          updateReviewDate(index, 'end', e.target.value)
                        }
                        required
                      />
                    </div>
                    {index > 0 && (
                      <button
                        type="button"
                        className={styles.removeButton}
                        onClick={() => removeReviewPeriod(index)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  className={styles.addButton}
                  onClick={addReviewPeriod}
                >
                  Add Review Period
                </button>
              </div>

              <div className={styles.dateGroup}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Number of Groups</label>
                  <input
                    className={styles.input}
                    type="number"
                    min="1"
                    value={newTheme.number_of_groups}
                    onChange={(e) =>
                      setNewTheme({
                        ...newTheme,
                        number_of_groups: parseInt(e.target.value),
                      })
                    }
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Auto Assign Groups</label>
                  <select
                    className={styles.select}
                    value={newTheme.auto_assign_group.toString()}
                    onChange={(e) =>
                      setNewTheme({
                        ...newTheme,
                        auto_assign_group: e.target.value === 'true',
                      })
                    }
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>

              <div className={styles.buttonGroup}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.submitButton}>
                  Create Theme
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Theme Modal */}
      {isManageOpen && selectedTheme && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Manage Theme</h2>
              <button
                className={styles.closeButton}
                onClick={() => setIsManageOpen(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleManageTheme} className={styles.form}>
              {/* Same form fields as Create Theme, but populated with selectedTheme data */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Theme Status</label>
                <div className={styles.statusGrid}>
                  <div className={styles.statusBox}>
                    <div className={styles.statusLabel}>Total Ideas</div>
                    <div className={styles.statusValue}>23</div>
                  </div>
                  <div className={styles.statusBox}>
                    <div className={styles.statusLabel}>Active Groups</div>
                    <div className={styles.statusValue}>8/10</div>
                  </div>
                </div>
              </div>

              <div className={styles.buttonGroup}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setIsManageOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.submitButton}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ThemeModals;
