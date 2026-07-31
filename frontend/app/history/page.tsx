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
import { trekApi, tripPlanApi } from '@/lib/api';
import type { TrekHistory, TripPlanSummary } from '@/lib/types';
import { getRiskVariant } from '@/lib/badgeHelpers';

type Tab = 'checklists' | 'itineraries';

export default function HistoryPage() {
    const { user } = useAuth();
    const [tab, setTab] = useState<Tab>('checklists');
    const [history, setHistory] = useState<TrekHistory[]>([]);
    const [itineraries, setItineraries] = useState<TripPlanSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            if (!user) {
                setIsLoading(false);
                return;
            }

            try {
                const [checklists, plans] = await Promise.all([
                    trekApi.getHistory(),
                    tripPlanApi.list(),
                ]);
                setHistory(checklists || []);
                setItineraries(plans || []);
            } catch (error) {
                console.error('Failed to fetch plans:', error);
            } finally {
                setIsLoading(false);
            }
        };

        void fetchAll();
    }, [user]);

    return (
        <ProtectedRoute>
            <PageContainer>
                <PageHeader
                    title="My plans"
                    description="Saved packing checklists and full itineraries in one place."
                    action={
                        <Link href="/planner">
                            <Button>Plan a trek</Button>
                        </Link>
                    }
                />

                <div className="mb-6 flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => setTab('checklists')}
                        className={`rounded-[var(--radius)] px-4 py-2 text-sm font-semibold ${
                            tab === 'checklists'
                                ? 'bg-[var(--accent)] text-white'
                                : 'bg-[var(--surface-muted)] text-[var(--muted)]'
                        }`}
                    >
                        Checklists ({history.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setTab('itineraries')}
                        className={`rounded-[var(--radius)] px-4 py-2 text-sm font-semibold ${
                            tab === 'itineraries'
                                ? 'bg-[var(--accent)] text-white'
                                : 'bg-[var(--surface-muted)] text-[var(--muted)]'
                        }`}
                    >
                        Itineraries ({itineraries.length})
                    </button>
                </div>

                {isLoading ? (
                    <SkeletonList count={3} />
                ) : tab === 'checklists' ? (
                    history.length === 0 ? (
                        <EmptyState
                            title="No checklists yet"
                            description="Run a quick packing checklist and it will appear here."
                            action={
                                <Link href="/planner?tab=checklist">
                                    <Button>Open checklist</Button>
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
                                                Checklist ·{' '}
                                                {new Date(item.date).toLocaleDateString()}
                                            </p>
                                            <h3 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
                                                {item.trek_name}
                                            </h3>
                                            {item.trek_type && (
                                                <p className="mt-1 text-sm text-[var(--muted)]">
                                                    {item.trek_type} difficulty
                                                </p>
                                            )}
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
                                                    Season
                                                </p>
                                                <p className="mt-1 font-semibold">{item.season}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                                                    Risk
                                                </p>
                                                <Badge
                                                    variant={getRiskVariant(item.risk_level)}
                                                    className="mt-1"
                                                >
                                                    {item.risk_level}
                                                </Badge>
                                            </div>
                                        </div>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )
                ) : itineraries.length === 0 ? (
                    <EmptyState
                        title="No itineraries yet"
                        description="Generate a full day-by-day plan and it will be saved here."
                        action={
                            <Link href="/planner?tab=itinerary">
                                <Button>Open itinerary planner</Button>
                            </Link>
                        }
                    />
                ) : (
                    <div className="flex flex-col gap-4">
                        {itineraries.map((item) => (
                            <Link key={item.id} href={`/planner?tab=itinerary&plan=${item.id}`}>
                                <Card className="flex flex-col gap-4 transition hover:border-[var(--accent)]/40 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-[var(--muted)]">
                                            Itinerary · {item.source}
                                            {item.created_at
                                                ? ` · ${new Date(item.created_at).toLocaleDateString()}`
                                                : ''}
                                        </p>
                                        <h3 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
                                            {item.title || item.destination}
                                        </h3>
                                        <p className="mt-1 text-sm text-[var(--muted)]">
                                            {item.destination} · {item.duration_days} days ·{' '}
                                            {item.difficulty}
                                        </p>
                                    </div>
                                    {item.risk_level && (
                                        <Badge variant={getRiskVariant(item.risk_level)}>
                                            {item.risk_level} risk
                                        </Badge>
                                    )}
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </PageContainer>
        </ProtectedRoute>
    );
}
