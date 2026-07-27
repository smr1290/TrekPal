import React from 'react';

export default function Card({
    children,
    className = '',
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={`rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)] ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}
