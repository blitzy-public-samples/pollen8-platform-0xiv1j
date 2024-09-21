import React, { ReactNode } from 'react';
import { useThemeContext } from 'src/shared/contexts/index';

interface ButtonProps {
  children: ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  fullWidth = false,
  className = '',
}) => {
  const { theme } = useThemeContext();

  // Define base button classes
  const baseClasses = 'font-semibold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

  // Define variant-specific classes
  const variantClasses = {
    primary: `bg-black text-white hover:bg-gray-800 focus:ring-gray-500 ${theme === 'dark' ? 'bg-white text-black hover:bg-gray-200' : ''}`,
    secondary: `bg-white text-black border border-black hover:bg-gray-100 focus:ring-gray-300 ${theme === 'dark' ? 'bg-gray-800 text-white border-white hover:bg-gray-700' : ''}`,
    outline: `bg-transparent text-black border border-black hover:bg-gray-100 focus:ring-gray-300 ${theme === 'dark' ? 'text-white border-white hover:bg-gray-800' : ''}`,
  };

  // Define size-specific classes
  const sizeClasses = {
    small: 'px-3 py-1 text-sm',
    medium: 'px-4 py-2',
    large: 'px-6 py-3 text-lg',
  };

  // Combine all classes
  const buttonClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${fullWidth ? 'w-full' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${className}
  `;

  return (
    <button
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled}
    >
      {children}
    </button>
  );
};