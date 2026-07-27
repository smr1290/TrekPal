import React from 'react';
import type { BadgeVariant } from '@/lib/badgeHelpers';

interface BadgeProps {
    children: React.ReactNode;
    variant?: BadgeVariant | string;
    className?: string;
}

const styles: Record<BadgeVariant, string> = {
    default: 'bg-[var(--surface-muted)] text-[var(--muted)]',
    success: 'bg-[var(--success-bg)] text-[var(--success)]',
    warning: 'bg-[var(--warning-bg)] text-[var(--warning)]',
    danger: 'bg-[var(--danger-bg)] text-[var(--danger)]',
    info: 'bg-[var(--info-bg)] text-[var(--info)]',
};

function isBadgeVariant(value: string): value is BadgeVariant {
    return value in styles;
}

export default function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
    const resolved: BadgeVariant = isBadgeVariant(variant) ? variant : 'default';

    return (
        <span
            className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-[11px] font-semibold ${styles[resolved]} ${className}`}
        >
            {children}
        </span>
    );
}
