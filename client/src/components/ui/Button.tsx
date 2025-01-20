import React from 'react';

interface ButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'outline';
}

const Button: React.FC<ButtonProps> = ({ onClick, disabled, children, size = 'md', variant = 'primary' }) => {
  const sizeClass = `btn-${size}`;
  const variantClass = `btn-${variant}`;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn ${sizeClass} ${variantClass}`}
    >
      {children}
    </button>
  );
};

export default Button;
