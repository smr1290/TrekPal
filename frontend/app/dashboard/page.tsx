'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import PageContainer from '@/components/PageContainer';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import Button from '@/components/Button';
import { EmptyState, SkeletonList } from '@/components/ui';
import Reveal, { Stagger, StaggerItem } from '@/components/Reveal';
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
            <div className="relative overflow-hidden border-b border-white/10 bg-[linear-gradient(155deg,#0a3324_0%,#146649_52%,#1f7a58_100%)]">
                <div className="aurora-band" aria-hidden />
                <div
                    className="ambient-orb -right-20 -top-10 h-72 w-72 bg-white/15"
                    aria-hidden
                />
                <div
                    className="ambient-orb ambient-orb-slow bottom-0 left-1/4 h-40 w-40 bg-[rgb(180_220_200_/0.25)]"
                    aria-hidden
                />
                <PageContainer className="relative py-14 sm:py-20">
                    <p className="anim-rise text-[0.7rem] font-bold uppercase tracking-[0.2em] text-white/55">
                        Your trail lodge
                    </p>
                    <h1 className="anim-rise-delay display-title mt-4 text-4xl text-white sm:text-5xl md:text-6xl">
                        Ready when you are,
                        <br className="hidden sm:block" /> {firstName}.
                    </h1>
                    <p className="anim-rise-late mt-4 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
                        Pick up a packing list, check the forecast mindset, or revisit what you
                        already saved.
                    </p>
                    <div className="anim-rise-late mt-8 flex flex-wrap items-center gap-4">
                        <Badge className="border-0 bg-white/15 text-white ring-white/20">
                            {user?.experience_level || 'Beginner'}
                        </Badge>
                        <Link
                            href="/profile"
                            className="text-sm font-semibold text-white/80 hover:text-white"
                        >
                            Edit experience →
                        </Link>
                        <Link href="/planner" className="btn-link-block w-full sm:ml-auto sm:w-auto">
                            <Button size="lg" variant="onDark" className="w-full sm:w-auto">
                                Plan a trek
                            </Button>
                        </Link>
                    </div>
                </PageContainer>
            </div>

            <PageContainer>
                <section className="relative mb-16">
                    <div
                        className="ambient-orb -right-10 top-0 h-48 w-48 bg-[var(--accent-soft)]"
                        aria-hidden
                    />
                    <Reveal>
                        <div className="mb-6 flex items-end justify-between gap-4">
                            <div>
                                <p className="eyebrow">Start here</p>
                                <h2 className="display-title mt-2 text-2xl sm:text-3xl">
                                    Where to next
                                </h2>
                            </div>
                        </div>
                    </Reveal>
                    <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {QUICK_LINKS.map((item) => (
                            <StaggerItem key={item.href}>
                                <Link href={item.href} className="group block h-full">
                                    <Card
                                        interactive
                                        spotlight
                                        className={`h-full ${
                                            item.primary
                                                ? 'border-[var(--accent)]/40 bg-[linear-gradient(160deg,var(--accent-soft),var(--surface))]'
                                                : ''
                                        }`}
                                    >
                                        <h3 className="text-lg font-semibold tracking-tight group-hover:text-[var(--accent)]">
                                            {item.title}
                                        </h3>
                                        <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                                            {item.description}
                                        </p>
                                        <p className="mt-4 text-xs font-bold uppercase tracking-[0.12em] text-[var(--accent)] opacity-0 transition-opacity group-hover:opacity-100">
                                            Open →
                                        </p>
                                    </Card>
                                </Link>
                            </StaggerItem>
                        ))}
                    </Stagger>
                </section>

                {!isLoading && checklists.length === 0 && itineraries.length === 0 && (
                    <section className="mb-14 rounded-[var(--radius-lg)] border border-[var(--accent)]/25 bg-[linear-gradient(160deg,var(--accent-soft),var(--surface))] p-6 sm:p-8">
                        <p className="eyebrow">First steps</p>
                        <h2 className="display-title mt-2 text-2xl sm:text-3xl">
                            Start with a Nepal classic
                        </h2>
                        <p className="mt-3 max-w-xl text-sm text-[var(--muted)]">
                            New here? Pick a route that matches your level, then jump into Plan trip.
                        </p>
                        <div className="btn-row mt-6">
                            {[
                                { name: 'Poon Hill', href: '/treks' },
                                { name: 'Annapurna Base Camp', href: '/treks' },
                                { name: 'Everest Base Camp', href: '/treks' },
                            ].map((t) => (
                                <Link key={t.name} href={t.href} className="btn-link">
                                    <Button variant="outline" size="sm">
                                        {t.name}
                                    </Button>
                                </Link>
                            ))}
                            <Link href="/planner" className="btn-link">
                                <Button size="sm">Plan a trek</Button>
                            </Link>
                        </div>
                    </section>
                )}

                <section className="grid gap-12 lg:grid-cols-2">
                    <Reveal>
                        <div>
                            <div className="mb-5 flex items-center justify-between gap-3">
                                <h2 className="display-title text-2xl">Recent checklists</h2>
                                <Link
                                    href="/history"
                                    className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--accent)] hover:underline"
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
                                        <Link href="/planner?tab=checklist" className="btn-link">
                                            <Button size="sm">Open checklist</Button>
                                        </Link>
                                    }
                                />
                            ) : (
                                <div className="space-y-3">
                                    {checklists.map((item) => (
                                        <Link
                                            key={item.history_id}
                                            href={`/history/${item.history_id}`}
                                        >
                                            <Card interactive spotlight>
                                                <p className="font-semibold tracking-tight">
                                                    {item.trek_name}
                                                </p>
                                                <p className="mt-1.5 text-xs text-[var(--muted)]">
                                                    {item.season} · {item.duration} days ·{' '}
                                                    {item.risk_level} risk
                                                </p>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Reveal>

                    <Reveal delay={0.08}>
                        <div>
                            <div className="mb-5 flex items-center justify-between gap-3">
                                <h2 className="display-title text-2xl">Recent itineraries</h2>
                                <Link
                                    href="/history"
                                    className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--accent)] hover:underline"
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
                                        <Link href="/planner?tab=itinerary" className="btn-link">
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
                                            <Card interactive spotlight>
                                                <p className="font-semibold tracking-tight">
                                                    {item.title || item.destination}
                                                </p>
                                                <p className="mt-1.5 text-xs text-[var(--muted)]">
                                                    {item.destination} · {item.duration_days} days ·{' '}
                                                    {item.difficulty}
                                                </p>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Reveal>
                </section>
            </PageContainer>
        </ProtectedRoute>
    );
}
