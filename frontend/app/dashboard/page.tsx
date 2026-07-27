'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import Button from '@/components/Button';
import PageContainer from '@/components/PageContainer';
import { PageHeader, EmptyState, SkeletonGrid } from '@/components/ui';
import { trekApi } from '@/lib/api';
import type { TrekHistory } from '@/lib/types';
import { getRiskVariant } from '@/lib/badgeHelpers';

export default function DashboardPage() {
    const { user } = useAuth();
    const [recentHistory, setRecentHistory] = useState<TrekHistory[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!user) return;
            try {
                const history = await trekApi.getHistory();
                setRecentHistory(history.slice(0, 3) || []);
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
            <PageContainer className="flex flex-col gap-12">
                <PageHeader
                    title={`Welcome back, ${user?.full_name.split(' ')[0] || 'trekker'}`}
                    description="Pick up a preparation, browse routes, or start a new packing plan."
                    action={
                        <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                                Experience
                            </p>
                            <p className="text-sm font-semibold text-[var(--foreground)]">
                                {user?.experience_level}
                            </p>
                        </div>
                    }
                />

                <section>
                    <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
                        Quick start
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-3">
                        <Link href="/prepare" className="block">
                            <Card className="h-full border-[var(--accent)]/25 bg-[var(--accent-soft)] transition hover:border-[var(--accent)]">
                                <h3 className="text-lg font-semibold text-[var(--accent)]">
                                    Prepare a trek
                                </h3>
                                <p className="mt-2 text-sm text-[var(--muted)]">
                                    Gear list + risk check for your next route.
                                </p>
                            </Card>
                        </Link>
                        <Link href="/treks" className="block">
                            <Card className="h-full transition hover:border-[var(--accent)]/40">
                                <h3 className="text-lg font-semibold">Browse treks</h3>
                                <p className="mt-2 text-sm text-[var(--muted)]">
                                    Altitude, duration, and difficulty at a glance.
                                </p>
                            </Card>
                        </Link>
                        <Link href="/history" className="block">
                            <Card className="h-full transition hover:border-[var(--accent)]/40">
                                <h3 className="text-lg font-semibold">Past plans</h3>
                                <p className="mt-2 text-sm text-[var(--muted)]">
                                    Reopen saved preparations anytime.
                                </p>
                            </Card>
                        </Link>
                    </div>
                </section>

                <section>
                    <div className="mb-4 flex items-end justify-between gap-4">
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
                            Recent plans
                        </h2>
                        <Link
                            href="/history"
                            className="text-sm font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)]"
                        >
                            View all
                        </Link>
                    </div>

                    {isLoading ? (
                        <SkeletonGrid count={3} columns="md:grid-cols-3" />
                    ) : recentHistory.length === 0 ? (
                        <EmptyState
                            title="No plans yet"
                            description="Start your first preparation — it only takes a minute."
                            action={
                                <Link href="/prepare">
                                    <Button>Prepare a trek</Button>
                                </Link>
                            }
                        />
                    ) : (
                        <div className="grid gap-4 md:grid-cols-3">
                            {recentHistory.map((item) => (
                                <Link key={item.history_id} href={`/history/${item.history_id}`}>
                                    <Card className="h-full transition hover:border-[var(--accent)]/40">
                                        <div className="mb-4 flex items-center justify-between gap-2">
                                            <span className="text-xs text-[var(--muted)]">
                                                {new Date(item.date).toLocaleDateString()}
                                            </span>
                                            <Badge variant={getRiskVariant(item.risk_level)}>
                                                {item.risk_level}
                                            </Badge>
                                        </div>
                                        <h3 className="text-lg font-semibold leading-snug">
                                            {item.trek_name}
                                        </h3>
                                        <p className="mt-4 text-sm text-[var(--muted)]">
                                            {item.duration} days
                                        </p>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>
            </PageContainer>
        </ProtectedRoute>
    );
}
