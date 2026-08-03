'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LoadingBlock } from '@/components/ui';
import PageContainer from '@/components/PageContainer';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            const search = typeof window !== 'undefined' ? window.location.search : '';
            const next = `${pathname}${search}`;
            router.push(`/login?next=${encodeURIComponent(next)}`);
        }
    }, [isAuthenticated, isLoading, router, pathname]);

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
