import React from 'react';
import './Card.css';

interface CardProps {
    children: React.ReactNode;
    variant?: 'default' | 'glass' | 'outlined' | 'flat';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    className?: string;
    onClick?: () => void;
    style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({
    children,
    variant = 'default',
    padding = 'md',
    className = '',
    onClick,
    style,
}) => {
    const baseClass = 'ui-card';
    const variantClass = `ui-card--${variant}`;
    const paddingClass = `ui-card--padding-${padding}`;
    const clickableClass = onClick ? 'ui-card--clickable' : '';

    return (
        <div
            className={`${baseClass} ${variantClass} ${paddingClass} ${clickableClass} ${className}`}
            onClick={onClick}
            style={style}
        >
            {children}
        </div>
    );
};
