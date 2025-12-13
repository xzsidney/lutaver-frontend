import React from 'react';
import './AffinityProgressBar.css';

interface AffinityProgressBarProps {
    percentage: number;
    label: string;
    schoolYear?: string;
}

export const AffinityProgressBar: React.FC<AffinityProgressBarProps> = ({
    percentage,
    label,
    schoolYear
}) => {
    // Determine color based on percentage (visual feedback)
    const getColor = (pct: number) => {
        if (pct < 30) return 'var(--error-color, #dc3545)';
        if (pct < 70) return 'var(--warning-color, #ffc107)';
        return 'var(--success-color, #28a745)';
    };

    return (
        <div className="affinity-progress">
            <div className="affinity-progress__header">
                <span className="affinity-progress__label">{label}</span>
                {schoolYear && <span className="affinity-progress__year">{schoolYear}</span>}
                <span className="affinity-progress__value">{percentage}%</span>
            </div>
            <div className="affinity-progress__track">
                <div
                    className="affinity-progress__fill"
                    style={{
                        width: `${percentage}%`,
                        backgroundColor: getColor(percentage)
                    }}
                />
            </div>
        </div>
    );
};
