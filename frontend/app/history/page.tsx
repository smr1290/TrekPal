'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import Button from '@/components/Button';
import PageContainer from '@/components/PageContainer';
import { PageHeader, EmptyState, SkeletonList } from '@/components/ui';
import { trekApi } from '@/lib/api';
import type { TrekHistory } from '@/lib/types';
import { getRiskVariant } from '@/lib/badgeHelpers';

export default function HistoryPage() {
    const { user } = useAuth();
    const [history, setHistory] = useState<TrekHistory[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!user) {
                setIsLoading(false);
                return;
            }

            try {
                const data = await trekApi.getHistory();
                setHistory(data || []);
            } catch (error) {
                console.error('Failed to fetch history:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();
    }, [user]);

    return (
        <ProtectedRoute>
            <PageContainer>
                <PageHeader
                    title="Trail log"
                    description="Every preparation you’ve saved — reopen gear lists and risk notes anytime."
                />

                {isLoading ? (
                    <SkeletonList count={3} />
                ) : history.length === 0 ? (
                    <EmptyState
                        title="Your log is empty"
                        description="Plan a trek once and it will show up here."
                        action={
                            <Link href="/planner?tab=checklist">
                                <Button>Plan a trek</Button>
                            </Link>
                        }
                    />
                ) : (
                    <div className="flex flex-col gap-4">
                        {history.map((item) => (
                            <Link key={item.history_id} href={`/history/${item.history_id}`}>
                                <Card className="flex flex-col gap-6 transition hover:border-[var(--accent)]/40 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-[var(--muted)]">
                                            Planned {new Date(item.date).toLocaleDateString()}
                                        </p>
                                        <h3 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
                                            {item.trek_name}
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-3 gap-6 sm:min-w-[280px]">
                                        <div>
                                            <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                                                Duration
                                            </p>
                                            <p className="mt-1 font-semibold">{item.duration} days</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                                                Altitude
                                            </p>
                                            <p className="mt-1 font-semibold">
                                                {item.input_altitude?.toLocaleString() || '—'} m
                                            </p>
                                        </div>
                                        <div>
                                            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                                                Risk
                                            </p>
                                            <Badge variant={getRiskVariant(item.risk_level)}>
                                                {item.risk_level}
                                            </Badge>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </PageContainer>
        </ProtectedRoute>
    );
}
