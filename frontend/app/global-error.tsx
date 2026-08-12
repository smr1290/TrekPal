'use client';

import { useEffect } from 'react';
import { captureClientException } from '@/lib/observability';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        captureClientException(error, { digest: error.digest });
    }, [error]);

    return (
        <html lang="en">
            <body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--background)] px-6 text-center">
                <h1 className="display-title text-2xl text-[var(--foreground)]">
                    Something went wrong
                </h1>
                <p className="max-w-md text-sm text-[var(--muted)]">
                    TrekPal hit an unexpected error. Try again, or head home while we look into it.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                    <button
                        type="button"
                        onClick={() => reset()}
                        className="rounded-[var(--radius)] bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
                    >
                        Try again
                    </button>
                    <a
                        href="/"
                        className="rounded-[var(--radius)] border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--accent)]"
                    >
                        Go home
                    </a>
                </div>
            </body>
        </html>
    );
}
