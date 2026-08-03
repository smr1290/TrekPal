import React from 'react';

export default function Card({
    children,
    className = '',
    interactive = false,
    ...props
}: React.HTMLAttributes<HTMLDivElement> & { interactive?: boolean }) {
    return (
        <div
            className={`rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)] ${
                interactive ? 'surface-interactive' : ''
            } ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}
