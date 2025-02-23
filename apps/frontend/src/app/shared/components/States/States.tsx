// States.tsx
import React from 'react';
import styles from './States.module.css';
import { LoadingStateProps, EmptyStateProps } from '@/app/shared/utils/types';

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
}) => (
  <section
    className={styles.loadingContainer}
    role="status"
    aria-label="Loading content"
  >
    <span className={styles.spinner} aria-hidden="true" />
    <p className={styles.message}>{message}</p>
  </section>
);

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No items found',
  description = 'There are no items to display at this time.',
  action,
}) => (
  <section
    className={styles.emptyContainer}
    role="status"
    aria-label="Empty state"
  >
    <span className={styles.iconContainer} aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
    </span>
    <h2 className={styles.title}>{title}</h2>
    <p className={styles.description}>{description}</p>
    {action && <footer className={styles.action}>{action}</footer>}
  </section>
);
