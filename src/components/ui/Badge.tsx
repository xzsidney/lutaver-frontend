import React from 'react';
import './Badge.css';

interface BadgeProps {
    label: string | number;
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
    size?: 'sm' | 'md';
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
    label,
    variant = 'primary',
    size = 'md',
    className = '',
}) => {
    return (
        <span className={`ui-badge ui-badge--${variant} ui-badge--${size} ${className}`}>
            {label}
        </span>
    );
};
