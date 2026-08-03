'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import PageContainer from '@/components/PageContainer';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import Button from '@/components/Button';
import { EmptyState, SkeletonList } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { trekApi, tripPlanApi } from '@/lib/api';
import type { TrekHistory, TripPlanSummary } from '@/lib/types';

const QUICK_LINKS = [
    {
        href: '/planner?tab=checklist',
        title: 'Plan your trek',
        description: 'Checklist or day-by-day itinerary with weather context.',
        primary: true,
    },
    {
        href: '/treks',
        title: 'Browse trails',
        description: 'Nepal routes with seasons and highlights.',
    },
    {
        href: '/gear',
        title: 'Check the kit',
        description: 'Quantities and Thamel/Pokhara rent tips.',
    },
    {
        href: '/knowledge',
        title: 'Read the guides',
        description: 'Permits, altitude safety, trail sense.',
    },
    {
        href: '/maps',
        title: 'Orient on the map',
        description: 'Verified landmarks — not fake rescue pins.',
    },
    {
        href: '/chat',
        title: 'Ask your buddy',
        description: 'Answers grounded in TrekPal knowledge.',
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
            <div className="relative overflow-hidden border-b border-[var(--border)] bg-[linear-gradient(160deg,#12352a_0%,#1a684c_48%,#2f7d62_100%)]">
                <div
                    className="pointer-events-none absolute -right-16 top-0 h-56 w-56 rounded-full bg-white/10 blur-2xl"
                    aria-hidden
                />
                <PageContainer className="relative py-12 sm:py-16">
                    <p className="anim-rise text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
                        Your trail buddy
                    </p>
                    <h1 className="anim-rise-delay mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                        Ready when you are, {firstName}.
                    </h1>
                    <p className="anim-rise-late mt-3 max-w-xl text-base leading-relaxed text-white/80">
                        Pick up a packing list, check the forecast mindset, or revisit what you
                        already saved.
                    </p>
                    <div className="anim-rise-late mt-6 flex flex-wrap items-center gap-3">
                        <Badge className="border-white/20 bg-white/15 text-white">
                            {user?.experience_level || 'Beginner'}
                        </Badge>
                        <Link
                            href="/profile"
                            className="text-sm font-semibold text-white/85 hover:text-white"
                        >
                            Edit experience →
                        </Link>
                        <Link href="/planner" className="sm:ml-auto">
                            <Button
                                size="lg"
                                className="bg-white text-[var(--accent-deep)] hover:bg-white/90"
                            >
                                Plan a trek
                            </Button>
                        </Link>
                    </div>
                </PageContainer>
            </div>

            <PageContainer>
                <section className="mb-14">
                    <h2 className="mb-5 font-[family-name:var(--font-display)] text-2xl font-semibold">
                        Where to next
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {QUICK_LINKS.map((item) => (
                            <Link key={item.href} href={item.href} className="group">
                                <Card
                                    interactive
                                    className={`h-full ${
                                        item.primary
                                            ? 'border-[var(--accent)]/35 bg-[var(--accent-soft)]'
                                            : ''
                                    }`}
                                >
                                    <h3 className="font-semibold group-hover:text-[var(--accent)]">
                                        {item.title}
                                    </h3>
                                    <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                                        {item.description}
                                    </p>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </section>

                <section className="grid gap-10 lg:grid-cols-2">
                    <div>
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
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
                                description="Run a packing checklist — TrekPal will remember it."
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
                                        <Card interactive>
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
                            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
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
                                        <Card interactive>
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
