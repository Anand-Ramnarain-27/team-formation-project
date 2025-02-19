import React from 'react';
import styles from './StatusBadge.module.css';

interface StatusBadgeProps {
  status: string;
  label: string;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  className,
}) => {
  return (
    <span
      className={`${styles.statusBadge} ${styles[status]} ${className || ''}`}
    >
      {label}
    </span>
  );
};

export default StatusBadge;
