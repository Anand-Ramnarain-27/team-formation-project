import React from 'react';
import styles from './FormGroup.module.css';

interface FormGroupProps {
  label: string;
  children: React.ReactNode; 
  className?: string;
}

const FormGroup: React.FC<FormGroupProps> = ({
  label,
  children,
  className,
}) => {
  return (
    <div className={`${styles.formGroup} ${className || ''}`}>
      <label className={styles.label}>{label}</label>
      {children}
    </div>
  );
};

export default FormGroup;
