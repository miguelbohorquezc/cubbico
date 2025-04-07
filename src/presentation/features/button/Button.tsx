import React, { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'light';
type ButtonSize = 'sm' | 'md' | 'lg';
type ButtonStyle = 'solid' | 'outline';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  styleType?: ButtonStyle;
  rounded?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  styleType = 'solid',
  rounded = false,
  icon,
  iconPosition = 'left',
  isLoading = false,
  fullWidth = false,
  children,
  className = '',
  ...props
}) => {
  const buttonClasses = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    styleType === 'outline' ? `btn-outline-${variant === 'accent' ? 'accent' : 'primary'}` : '',
    rounded ? 'btn-rounded' : '',
    icon ? 'btn-icon' : '',
    isLoading ? 'btn-loading' : '',
    fullWidth ? 'btn-full' : '',
    className,
  ].filter(Boolean).join(' ');

  const renderContent = () => {
    if (isLoading) return null;
    
    return (
      <>
        {icon && iconPosition === 'left' && icon}
        {children}
        {icon && iconPosition === 'right' && icon}
      </>
    );
  };

  return (
    <button
      className={buttonClasses}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {renderContent()}
    </button>
  );
};

export default Button;