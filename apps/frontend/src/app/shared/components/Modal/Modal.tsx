import React, { ReactNode } from 'react';
import styles from './Modal.module.css';
import Button from '../Button/Button';
import buttonStyles from '@/app/shared/components/Button/Button.module.css';
import style from '@/app/shared/components/Button/Button.module.css'

interface SharedModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'small' | 'medium' | 'large';
  showFooter?: boolean;
  footerContent?: ReactNode;
}

export const SharedModal: React.FC<SharedModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  showFooter = false,
  footerContent,
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    small: styles.modalSmall,
    medium: styles.modalMedium,
    large: styles.modalLarge,
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={`${styles.modal} ${sizeClasses[size]}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h2>{title}</h2>
          <button onClick={onClose} className={styles.closeButton}>
            ×
          </button>
        </div>

        <div className={styles.modalContent}>{children}</div>

        {showFooter && (
          <div className={styles.modalFooter}>
            {footerContent || (
              <>
                <button onClick={onClose} className={buttonStyles.third}>
                  Cancel
                </button>
                <button
                  type="submit"
                  form="modalForm"
                  className={styles.submitButton}
                >
                  Submit
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
