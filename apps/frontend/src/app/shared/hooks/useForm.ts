import { useState } from 'react';

const useForm = <T extends Record<string, any>>(initialState: T) => {
  const [formData, setFormData] = useState<T>(initialState);

  const handleChange = (field: keyof T, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (callback: (data: T) => void) => (e: React.FormEvent) => {
    e.preventDefault();
    callback(formData);
  };

  return { formData, handleChange, handleSubmit };
};

export default useForm;