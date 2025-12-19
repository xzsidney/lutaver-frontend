
import React, { useEffect, useState } from 'react';
import { RadioMessage } from '../../game/stealth/types';

interface RadioHUDProps {
    message: RadioMessage | null;
}

const RadioHUD: React.FC<RadioHUDProps> = ({ message }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (message) {
            setVisible(true);
            const timer = setTimeout(() => setVisible(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    if (!message || !visible) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '8rem',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            maxWidth: '32rem',
            padding: '0 1rem',
            transition: 'all 0.3s ease-in-out',
            opacity: visible ? 1 : 0,
            animation: 'slideUp 0.3s ease-out',
            zIndex: 100
        }}>
            <style>
                {`
          @keyframes slideUp {
            from { transform: translate(-50%, 20px); opacity: 0; }
            to { transform: translate(-50%, 0); opacity: 1; }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: .5; }
          }
        `}
            </style>
            <div style={{
                backgroundColor: 'rgba(15, 23, 42, 0.9)', // slate-900/90
                border: '1px solid rgba(51, 65, 85, 0.5)', // slate-700/50
                backdropFilter: 'blur(12px)',
                padding: '1rem',
                borderRadius: '0.75rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                color: 'white'
            }}>
                <div style={{
                    backgroundColor: 'rgba(14, 165, 233, 0.2)', // sky-500/20
                    padding: '0.5rem',
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <svg style={{ width: '1.5rem', height: '1.5rem', color: '#38bdf8' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{
                            fontSize: '0.75rem',
                            fontFamily: 'monospace',
                            fontWeight: 'bold',
                            color: '#38bdf8', // sky-400
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em'
                        }}>{message.sender}</span>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <span style={{ width: '4px', height: '12px', backgroundColor: 'rgba(14, 165, 233, 0.5)', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></span>
                            <span style={{ width: '4px', height: '12px', backgroundColor: 'rgba(14, 165, 233, 0.3)', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite', animationDelay: '0.075s' }}></span>
                            <span style={{ width: '4px', height: '12px', backgroundColor: 'rgba(14, 165, 233, 0.1)', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite', animationDelay: '0.15s' }}></span>
                        </div>
                    </div>
                    <p style={{
                        color: '#f1f5f9', // slate-100
                        fontFamily: 'monospace',
                        fontSize: '0.875rem',
                        lineHeight: '1.625',
                        margin: 0
                    }}>
                        {message.text}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RadioHUD;
