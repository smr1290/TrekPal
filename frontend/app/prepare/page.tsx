'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import PageContainer from '@/components/PageContainer';
import { LoadingBlock } from '@/components/ui';

/** Old /prepare URL — redirects into the unified Plan trip checklist tab. */
export default function PrepareRedirectPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/planner?tab=checklist');
    }, [router]);

    return (
        <ProtectedRoute>
            <PageContainer>
                <LoadingBlock label="Opening Plan trip…" />
            </PageContainer>
        </ProtectedRoute>
    );
}
