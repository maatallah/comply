import React, { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
    onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ id, message, type, duration = 3000, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(id);
        }, duration);

        return () => clearTimeout(timer);
    }, [id, duration, onClose]);

    const bgColors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
        warning: 'bg-orange-500',
    };

    const icons = {
        success: (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
        ),
        error: (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
        ),
        info: (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        warning: (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        ),
    };

    // Inline styles to ensure it works without Tailwind being fully configured
    const getStyles = (type: ToastType) => {
        const baseStyle: React.CSSProperties = {
            display: 'flex',
            alignItems: 'center',
            padding: '1rem',
            borderRadius: '0.375rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            marginBottom: '0.5rem',
            color: 'white',
            minWidth: '300px',
            transition: 'all 0.3s ease-in-out',
            zIndex: 50,
        };

        switch (type) {
            case 'success': return { ...baseStyle, backgroundColor: '#10B981' }; // green-500
            case 'error': return { ...baseStyle, backgroundColor: '#EF4444' }; // red-500
            case 'info': return { ...baseStyle, backgroundColor: '#3B82F6' }; // blue-500
            case 'warning': return { ...baseStyle, backgroundColor: '#F97316' }; // orange-500
        }
    };

    return (
        <div style={getStyles(type)} className="toast-animation">
            <div style={{ marginRight: '0.75rem' }}>
                {icons[type]}
            </div>
            <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 500 }}>{message}</p>
            </div>
            <button
                onClick={() => onClose(id)}
                style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'white',
                    opacity: 0.8,
                    cursor: 'pointer',
                    padding: 0,
                    marginLeft: '0.5rem'
                }}
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '16px', height: '16px' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
};

export default Toast;
