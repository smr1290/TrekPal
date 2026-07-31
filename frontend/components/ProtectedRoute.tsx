'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LoadingBlock } from '@/components/ui';
import PageContainer from '@/components/PageContainer';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
        return (
            <PageContainer>
                <LoadingBlock label="Checking sign-in…" />
            </PageContainer>
        );
    }

    if (!isAuthenticated) {
        return (
            <PageContainer>
                <LoadingBlock label="Redirecting to login…" />
            </PageContainer>
        );
    }

    return <>{children}</>;
}
