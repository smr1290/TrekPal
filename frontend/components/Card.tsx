// Reusable Card Component

import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    glass?: boolean;
    hover?: boolean;
    style?: React.CSSProperties;
}

export default function Card({
    children,
    className = '',
    glass = false,
    hover = false,
    style,
}: CardProps) {
    const baseStyles = 'rounded-xl p-6 transition-all duration-300';
    const glassStyles = glass ? 'glass' : 'bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-md)]';
    const hoverStyles = hover ? 'hover:shadow-[var(--shadow-lg)] cursor-pointer' : '';

    return (
        <div className={`${baseStyles} ${glassStyles} ${hoverStyles} ${className}`} style={style}>
            {children}
        </div>
    );
}
