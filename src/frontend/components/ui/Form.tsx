import React, { ReactNode } from 'react';
import { useThemeContext } from 'src/shared/contexts/index';

interface FormProps {
  children: ReactNode;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  className?: string;
}

interface FormInputProps {
  type: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

interface FormLabelProps {
  htmlFor: string;
  children: ReactNode;
  className?: string;
}

interface FormErrorProps {
  children: ReactNode;
  className?: string;
}

export const Form: React.FC<FormProps> = ({ children, onSubmit, className }) => {
  const { theme } = useThemeContext();

  const baseClasses = 'w-full max-w-md mx-auto';
  const themeClasses = theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-black';
  const combinedClasses = `${baseClasses} ${themeClasses} ${className || ''}`;

  return (
    <form onSubmit={onSubmit} className={combinedClasses}>
      {children}
    </form>
  );
};

export const FormInput: React.FC<FormInputProps> = ({
  type,
  name,
  value,
  onChange,
  placeholder,
  disabled,
  className,
}) => {
  const { theme } = useThemeContext();

  const baseClasses = 'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2';
  const themeClasses = theme === 'dark'
    ? 'bg-gray-700 border-gray-600 focus:ring-white text-white'
    : 'bg-white border-gray-300 focus:ring-black text-black';
  const combinedClasses = `${baseClasses} ${themeClasses} ${className || ''}`;

  return (
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={combinedClasses}
      aria-invalid={false}
    />
  );
};

export const FormLabel: React.FC<FormLabelProps> = ({ htmlFor, children, className }) => {
  const { theme } = useThemeContext();

  const baseClasses = 'block mb-2 font-bold';
  const themeClasses = theme === 'dark' ? 'text-white' : 'text-black';
  const combinedClasses = `${baseClasses} ${themeClasses} ${className || ''}`;

  return (
    <label htmlFor={htmlFor} className={combinedClasses}>
      {children}
    </label>
  );
};

export const FormError: React.FC<FormErrorProps> = ({ children, className }) => {
  const { theme } = useThemeContext();

  const baseClasses = 'text-sm mt-1';
  const themeClasses = theme === 'dark' ? 'text-red-400' : 'text-red-600';
  const combinedClasses = `${baseClasses} ${themeClasses} ${className || ''}`;

  return (
    <p className={combinedClasses} role="alert">
      {children}
    </p>
  );
};