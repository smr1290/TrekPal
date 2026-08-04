'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
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

function checklistSubtitle(item: TrekHistory): string {
    if (item.destination?.trim()) {
        return item.trek_type ? `${item.trek_type} difficulty` : item.destination;
    }
    if (item.trek_type) {
        return `Older save · ${item.trek_type} difficulty · no destination recorded`;
    }
    return 'Older save · no destination recorded';
}

export default function HistoryPage() {
    const { user } = useAuth();
    const reduce = useReducedMotion();
    const [tab, setTab] = useState<Tab>('checklists');
    const [history, setHistory] = useState<TrekHistory[]>([]);
    const [itineraries, setItineraries] = useState<TripPlanSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deletingChecklistId, setDeletingChecklistId] = useState<number | null>(null);
    const [deletingPlanId, setDeletingPlanId] = useState<number | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

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

    const deleteChecklist = async (historyId: number, label: string) => {
        const confirmed = window.confirm(
            `Delete the packing checklist “${label}”? This cannot be undone.`
        );
        if (!confirmed) return;

        setActionError(null);
        setDeletingChecklistId(historyId);
        try {
            await trekApi.deleteHistory(historyId);
            setHistory((prev) => prev.filter((item) => item.history_id !== historyId));
        } catch (error) {
            console.error('Failed to delete checklist:', error);
            setActionError('Could not delete that checklist. Please try again.');
        } finally {
            setDeletingChecklistId(null);
        }
    };

    const deleteItinerary = async (planId: number, label: string) => {
        const confirmed = window.confirm(
            `Delete the itinerary “${label}”? This cannot be undone.`
        );
        if (!confirmed) return;

        setActionError(null);
        setDeletingPlanId(planId);
        try {
            await tripPlanApi.delete(planId);
            setItineraries((prev) => prev.filter((item) => item.id !== planId));
        } catch (error) {
            console.error('Failed to delete itinerary:', error);
            setActionError('Could not delete that itinerary. Please try again.');
        } finally {
            setDeletingPlanId(null);
        }
    };

    const exitMotion = reduce
        ? undefined
        : { opacity: 0, height: 0, marginBottom: 0, overflow: 'hidden' as const };

    return (
        <ProtectedRoute>
            <PageContainer>
                <PageHeader
                    eyebrow="Your saved trailwork"
                    title="My plans"
                    description="Saved packing checklists and full itineraries in one place."
                    action={
                        <Link href="/planner" className="btn-link">
                            <Button>Plan a trek</Button>
                        </Link>
                    }
                />

                {actionError && (
                    <p className="state-error mb-4" role="alert">
                        {actionError}
                    </p>
                )}

                <div className="mb-8 flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => setTab('checklists')}
                        className={`chip ${tab === 'checklists' ? 'chip-active' : ''}`}
                    >
                        Checklists ({history.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setTab('itineraries')}
                        className={`chip ${tab === 'itineraries' ? 'chip-active' : ''}`}
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
                                <Link href="/planner?tab=checklist" className="btn-link">
                                    <Button>Open checklist</Button>
                                </Link>
                            }
                        />
                    ) : (
                        <div className="flex flex-col gap-4">
                            <AnimatePresence initial={false}>
                                {history.map((item) => (
                                    <motion.div
                                        key={item.history_id}
                                        layout={!reduce}
                                        initial={false}
                                        exit={exitMotion}
                                        transition={{ duration: 0.28 }}
                                    >
                                        <Card className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                                            <Link
                                                href={`/history/${item.history_id}`}
                                                className="min-w-0 flex-1 transition hover:opacity-90"
                                            >
                                                <p className="text-xs font-medium text-[var(--muted)]">
                                                    Checklist ·{' '}
                                                    {new Date(item.date).toLocaleDateString()}
                                                </p>
                                                <h3 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
                                                    {item.trek_name}
                                                </h3>
                                                <p className="mt-1 text-sm text-[var(--muted)]">
                                                    {checklistSubtitle(item)}
                                                </p>
                                                <div className="mt-4 grid grid-cols-3 gap-6 sm:max-w-md">
                                                    <div>
                                                        <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                                                            Duration
                                                        </p>
                                                        <p className="mt-1 font-semibold">
                                                            {item.duration} days
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                                                            Season
                                                        </p>
                                                        <p className="mt-1 font-semibold">
                                                            {item.season}
                                                        </p>
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
                                            </Link>
                                            <Button
                                                type="button"
                                                variant="danger"
                                                size="sm"
                                                className="shrink-0"
                                                loading={deletingChecklistId === item.history_id}
                                                onClick={() =>
                                                    void deleteChecklist(
                                                        item.history_id,
                                                        item.trek_name
                                                    )
                                                }
                                            >
                                                {deletingChecklistId === item.history_id
                                                    ? 'Deleting…'
                                                    : 'Delete'}
                                            </Button>
                                        </Card>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )
                ) : itineraries.length === 0 ? (
                    <EmptyState
                        title="No itineraries yet"
                        description="Generate a full day-by-day plan and it will be saved here."
                        action={
                            <Link href="/planner?tab=itinerary" className="btn-link">
                                <Button>Open itinerary planner</Button>
                            </Link>
                        }
                    />
                ) : (
                    <div className="flex flex-col gap-4">
                        <AnimatePresence initial={false}>
                            {itineraries.map((item) => (
                                <motion.div
                                    key={item.id}
                                    layout={!reduce}
                                    initial={false}
                                    exit={exitMotion}
                                    transition={{ duration: 0.28 }}
                                >
                                    <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                        <Link
                                            href={`/planner?tab=itinerary&plan=${item.id}`}
                                            className="min-w-0 flex-1 transition hover:opacity-90"
                                        >
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
                                        </Link>
                                        <div className="flex shrink-0 flex-wrap items-center gap-3 self-start sm:self-center">
                                            {item.risk_level && (
                                                <Badge variant={getRiskVariant(item.risk_level)}>
                                                    {item.risk_level} risk
                                                </Badge>
                                            )}
                                            <Button
                                                type="button"
                                                variant="danger"
                                                size="sm"
                                                loading={deletingPlanId === item.id}
                                                onClick={() =>
                                                    void deleteItinerary(
                                                        item.id,
                                                        item.title || item.destination
                                                    )
                                                }
                                            >
                                                {deletingPlanId === item.id
                                                    ? 'Deleting…'
                                                    : 'Delete'}
                                            </Button>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </PageContainer>
        </ProtectedRoute>
    );
}
