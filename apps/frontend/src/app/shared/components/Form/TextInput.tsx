import React from 'react';
import styles from './TextInput.module.css';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void; 
  placeholder?: string;
  className?: string;
  type?: string; 
}

const TextInput: React.FC<TextInputProps> = ({
  value,
  onChange,
  placeholder = '',
  className = '',
  type = 'text',
}) => {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`${styles.textInput} ${className}`}
    />
  );
};

export default TextInput;