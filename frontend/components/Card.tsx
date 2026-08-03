'use client';

import React, { useRef } from 'react';

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
    interactive?: boolean;
    /** Soft emerald spotlight that follows the cursor */
    spotlight?: boolean;
};

export default function Card({
    children,
    className = '',
    interactive = false,
    spotlight = false,
    onMouseMove,
    ...props
}: CardProps) {
    const ref = useRef<HTMLDivElement>(null);
    const enableSpotlight = spotlight || interactive;

    const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
        onMouseMove?.(e);
        if (!enableSpotlight || !ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        ref.current.style.setProperty('--spot-x', `${x}%`);
        ref.current.style.setProperty('--spot-y', `${y}%`);
    };

    return (
        <div
            ref={ref}
            onMouseMove={handleMove}
            className={`rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)] ${
                interactive
                    ? 'surface-interactive focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]'
                    : ''
            } ${enableSpotlight ? 'card-spotlight' : ''} ${className}`}
            tabIndex={interactive ? 0 : undefined}
            {...props}
        >
            {children}
        </div>
    );
}
