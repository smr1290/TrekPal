'use client';

/**
 * S6: optional Sentry for client-side errors (production only when DSN is set).
 */
import * as Sentry from '@sentry/react';

let initialized = false;

export function initClientObservability(): void {
    const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN?.trim();
    if (!dsn || initialized || typeof window === 'undefined') return;

    Sentry.init({
        dsn,
        environment: process.env.NODE_ENV,
        tracesSampleRate: 0.1,
        enabled: process.env.NODE_ENV === 'production',
    });
    initialized = true;
}

export function captureClientException(
    error: unknown,
    context?: Record<string, unknown>
): void {
    if (!process.env.NEXT_PUBLIC_SENTRY_DSN?.trim()) return;
    Sentry.captureException(error, { extra: context });
}
