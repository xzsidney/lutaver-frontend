import React from 'react';
import './Button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    isLoading = false,
    leftIcon,
    rightIcon,
    className = '',
    disabled,
    ...props
}) => {
    const baseClass = 'ui-button';
    const variantClass = `ui-button--${variant}`;
    const sizeClass = `ui-button--${size}`;
    const widthClass = fullWidth ? 'ui-button--full-width' : '';
    const loadingClass = isLoading ? 'ui-button--loading' : '';

    return (
        <button
            className={`${baseClass} ${variantClass} ${sizeClass} ${widthClass} ${loadingClass} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <span className="ui-button__spinner" />}
            {!isLoading && leftIcon && <span className="ui-button__icon-left">{leftIcon}</span>}
            <span className="ui-button__content">{children}</span>
            {!isLoading && rightIcon && <span className="ui-button__icon-right">{rightIcon}</span>}
        </button>
    );
};
