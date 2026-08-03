'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import PageContainer from '@/components/PageContainer';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import Button from '@/components/Button';
import { PageHeader, EmptyState, SkeletonList } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { trekApi, tripPlanApi } from '@/lib/api';
import type { TrekHistory, TripPlanSummary } from '@/lib/types';

const QUICK_LINKS = [
    {
        href: '/planner?tab=checklist',
        title: 'Plan trip',
        description: 'Build a packing checklist or full itinerary.',
        primary: true,
    },
    {
        href: '/treks',
        title: 'Browse treks',
        description: 'Pick a Nepal route with seasons and highlights.',
    },
    {
        href: '/gear',
        title: 'Pack kit',
        description: 'Reference gear with quantities and rent tips.',
    },
    {
        href: '/knowledge',
        title: 'Knowledge',
        description: 'Permits, altitude safety, and trail guides.',
    },
    {
        href: '/maps',
        title: 'Maps',
        description: 'Verified landmarks for orientation.',
    },
    {
        href: '/chat',
        title: 'Ask TrekPal',
        description: 'Questions grounded in the knowledge base.',
    },
];

export default function DashboardPage() {
    const { user } = useAuth();
    const [checklists, setChecklists] = useState<TrekHistory[]>([]);
    const [itineraries, setItineraries] = useState<TripPlanSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [history, plans] = await Promise.all([
                    trekApi.getHistory(),
                    tripPlanApi.list(),
                ]);
                setChecklists((history || []).slice(0, 3));
                setItineraries((plans || []).slice(0, 3));
            } catch (error) {
                console.error('Dashboard load failed:', error);
            } finally {
                setIsLoading(false);
            }
        };
        void load();
    }, []);

    const firstName = user?.full_name?.split(' ')[0] || 'Trekker';

    return (
        <ProtectedRoute>
            <PageContainer>
                <PageHeader
                    title={`Welcome back, ${firstName}`}
                    description="Your Nepal trek prep hub — plan, pack, and revisit saved work."
                    action={
                        <Link href="/planner">
                            <Button>Plan a trek</Button>
                        </Link>
                    }
                />

                <div className="mb-8 flex flex-wrap items-center gap-3">
                    <Badge variant="info">{user?.experience_level || 'Beginner'}</Badge>
                    <Link
                        href="/profile"
                        className="text-sm font-semibold text-[var(--accent)] hover:underline"
                    >
                        Edit experience →
                    </Link>
                </div>

                <section className="mb-12">
                    <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
                        Quick start
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {QUICK_LINKS.map((item) => (
                            <Link key={item.href} href={item.href} className="group">
                                <Card
                                    className={`h-full transition group-hover:border-[var(--accent)]/40 ${
                                        item.primary ? 'border-[var(--accent)]/30 bg-[var(--accent-soft)]' : ''
                                    }`}
                                >
                                    <h3 className="font-semibold group-hover:text-[var(--accent)]">
                                        {item.title}
                                    </h3>
                                    <p className="mt-2 text-sm text-[var(--muted)]">{item.description}</p>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </section>

                <section className="grid gap-8 lg:grid-cols-2">
                    <div>
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
                                Recent checklists
                            </h2>
                            <Link
                                href="/history"
                                className="text-xs font-semibold text-[var(--accent)] hover:underline"
                            >
                                My plans →
                            </Link>
                        </div>
                        {isLoading ? (
                            <SkeletonList count={2} />
                        ) : checklists.length === 0 ? (
                            <EmptyState
                                title="No checklists yet"
                                description="Run a packing checklist from Plan trip."
                                action={
                                    <Link href="/planner?tab=checklist">
                                        <Button size="sm">Open checklist</Button>
                                    </Link>
                                }
                            />
                        ) : (
                            <div className="space-y-3">
                                {checklists.map((item) => (
                                    <Link key={item.history_id} href={`/history/${item.history_id}`}>
                                        <Card className="transition hover:border-[var(--accent)]/35">
                                            <p className="font-semibold">{item.trek_name}</p>
                                            <p className="mt-1 text-xs text-[var(--muted)]">
                                                {item.season} · {item.duration} days · {item.risk_level}{' '}
                                                risk
                                            </p>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
                                Recent itineraries
                            </h2>
                            <Link
                                href="/history"
                                className="text-xs font-semibold text-[var(--accent)] hover:underline"
                            >
                                My plans →
                            </Link>
                        </div>
                        {isLoading ? (
                            <SkeletonList count={2} />
                        ) : itineraries.length === 0 ? (
                            <EmptyState
                                title="No itineraries yet"
                                description="Generate a day-by-day plan when you are ready."
                                action={
                                    <Link href="/planner?tab=itinerary">
                                        <Button size="sm">Open itinerary</Button>
                                    </Link>
                                }
                            />
                        ) : (
                            <div className="space-y-3">
                                {itineraries.map((item) => (
                                    <Link
                                        key={item.id}
                                        href={`/planner?tab=itinerary&plan=${item.id}`}
                                    >
                                        <Card className="transition hover:border-[var(--accent)]/35">
                                            <p className="font-semibold">
                                                {item.title || item.destination}
                                            </p>
                                            <p className="mt-1 text-xs text-[var(--muted)]">
                                                {item.destination} · {item.duration_days} days ·{' '}
                                                {item.difficulty}
                                            </p>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </PageContainer>
        </ProtectedRoute>
    );
}
