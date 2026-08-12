'use client';

import { useEffect } from 'react';
import { initClientObservability } from '@/lib/observability';

/** Mount once in root layout to initialize optional Sentry on the client. */
export default function ObservabilityInit() {
    useEffect(() => {
        initClientObservability();
    }, []);
    return null;
}
