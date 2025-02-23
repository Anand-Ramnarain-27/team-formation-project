import React, { ReactNode } from 'react';
import styles from './Modal.module.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'small' | 'medium' | 'large';
  showFooter?: boolean;
  footerContent?: ReactNode;
}

export const SharedModal: React.FC<ModalProps> = ({
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
    <aside className={styles.modalOverlay} onClick={onClose}>
      <article
        className={`${styles.modal} ${sizeClasses[size]}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <header className={styles.modalHeader}>
          <h2 id="modal-title">{title}</h2>
          <button
            onClick={onClose}
            className={styles.closeButton}
            aria-label="Close modal"
          >
            ×
          </button>
        </header>

        <main className={styles.modalContent}>{children}</main>

        {showFooter && (
          <footer className={styles.modalFooter}>
            {footerContent || (
              <>
                <button
                  onClick={onClose}
                  className={styles.cancelButton}
                  type="button"
                >
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
          </footer>
        )}
      </article>
    </aside>
  );
};
