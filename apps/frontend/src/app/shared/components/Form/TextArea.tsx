import React from 'react';
import styles from './TextArea.module.css';

interface TextAreaProps {
  value: string; 
  onChange: (value: string) => void; 
  placeholder?: string;
  className?: string; 
  rows?: number; 
}

const TextArea: React.FC<TextAreaProps> = ({
  value,
  onChange,
  placeholder = '',
  className = '',
  rows = 3,
}) => {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`${styles.textArea} ${className}`}
      rows={rows}
    />
  );
};

export default TextArea;
