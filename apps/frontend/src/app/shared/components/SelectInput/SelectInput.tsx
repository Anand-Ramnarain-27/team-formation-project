import React from 'react';
import styles from './SelectInput.module.css';

interface SelectInputProps {
  value: string; // Selected value
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string; 
  className?: string; 
}

const SelectInput: React.FC<SelectInputProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  className = '',
}) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${styles.selectInput} ${className}`}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default SelectInput;
