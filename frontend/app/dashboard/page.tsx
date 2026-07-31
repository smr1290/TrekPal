'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import PageContainer from '@/components/PageContainer';
import { LoadingBlock } from '@/components/ui';

/** Dashboard removed — Plan trip is the post-login home. */
export default function DashboardRedirectPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/planner');
    }, [router]);

    return (
        <ProtectedRoute>
            <PageContainer>
                <LoadingBlock label="Opening Plan trip…" />
            </PageContainer>
        </ProtectedRoute>
    );
}
