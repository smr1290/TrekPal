'use client';

import React from 'react';
import Link from 'next/link';
import Button from '@/components/Button';

export type DependencyNextAction = {
    label: string;
    href: string;
};

type DependencyErrorProps = {
    title: string;
    message: string;
    onRetry?: () => void;
    retryLabel?: string;
    nextActions?: DependencyNextAction[];
};

/**
 * Shared empty/error panel for external dependency failures (Groq, Open-Meteo).
 * Names the service, offers retry, and links to offline-safe next steps.
 */
export default function DependencyError({
    title,
    message,
    onRetry,
    retryLabel = 'Try again',
    nextActions = [],
}: DependencyErrorProps) {
    return (
        <div
            className="mt-4 rounded-[var(--radius)] border border-[var(--warning)]/35 bg-[var(--warning-bg)] px-4 py-4"
            role="alert"
        >
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--warning)]">
                {title}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--foreground)]">{message}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
                {onRetry ? (
                    <Button type="button" variant="secondary" onClick={onRetry}>
                        {retryLabel}
                    </Button>
                ) : null}
                {nextActions.map((action) => (
                    <Link
                        key={action.href}
                        href={action.href}
                        className="text-sm font-semibold text-[var(--accent)] hover:underline"
                    >
                        {action.label} →
                    </Link>
                ))}
            </div>
        </div>
    );
}
