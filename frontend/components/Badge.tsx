import React from 'react';
import type { BadgeVariant } from '@/lib/badgeHelpers';

interface BadgeProps {
    children: React.ReactNode;
    variant?: BadgeVariant | string;
    className?: string;
}

const styles: Record<BadgeVariant, string> = {
    default: 'bg-[var(--surface-muted)] text-[var(--muted)] ring-1 ring-[var(--border)]',
    success: 'bg-[var(--success-bg)] text-[var(--success)] ring-1 ring-[var(--success)]/15',
    warning: 'bg-[var(--warning-bg)] text-[var(--warning)] ring-1 ring-[var(--warning)]/15',
    danger: 'bg-[var(--danger-bg)] text-[var(--danger)] ring-1 ring-[var(--danger)]/15',
    info: 'bg-[var(--info-bg)] text-[var(--info)] ring-1 ring-[var(--info)]/15',
};

function isBadgeVariant(value: string): value is BadgeVariant {
    return value in styles;
}

export default function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
    const resolved: BadgeVariant = isBadgeVariant(variant) ? variant : 'default';

    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] ${styles[resolved]} ${className}`}
        >
            {children}
        </span>
    );
}
