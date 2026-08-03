'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import Button from '@/components/Button';
import Input from '@/components/Input';
import PageContainer from '@/components/PageContainer';
import { PageHeader, EmptyState, SkeletonGrid } from '@/components/ui';
import { trekApi } from '@/lib/api';
import type { Trek } from '@/lib/types';
import { getDifficultyVariant } from '@/lib/badgeHelpers';
import { useAuth } from '@/context/AuthContext';

function planHref(trek: Trek) {
    const params = new URLSearchParams({
        tab: 'checklist',
        destination: trek.trek_name,
        altitude: String(trek.max_altitude),
        duration: String(trek.duration_days),
        difficulty: trek.difficulty,
        trek_id: String(trek.id),
    });
    return `/planner?${params.toString()}`;
}

export default function TreksPage() {
    const { isAuthenticated } = useAuth();
    const [treks, setTreks] = useState<Trek[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState('All');

    useEffect(() => {
        const fetchTreks = async () => {
            try {
                const data = await trekApi.listTreks();
                setTreks(data || []);
                setLoadError(null);
            } catch {
                setLoadError('Could not load treks. Check that the API is running.');
                setTreks([]);
            } finally {
                setIsLoading(false);
            }
        };

        void fetchTreks();
    }, []);

    const filteredTreks = (treks || []).filter((trek) => {
        const matchesSearch = trek.trek_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDifficulty =
            difficultyFilter === 'All' || trek.difficulty === difficultyFilter;
        return matchesSearch && matchesDifficulty;
    });

    return (
        <PageContainer>
            <PageHeader
                title="Trail guide"
                description="Pick a route, then jump into Plan trip with altitude and duration already filled."
                action={
                    <div className="w-full sm:w-72">
                        <Input
                            type="search"
                            placeholder="Search treks…"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="!mb-0"
                            aria-label="Search treks"
                        />
                    </div>
                }
            />

            <div className="mb-6 flex flex-wrap gap-2">
                {['All', 'Easy', 'Moderate', 'Hard'].map((level) => (
                    <button
                        key={level}
                        type="button"
                        onClick={() => setDifficultyFilter(level)}
                        className={`rounded-[var(--radius)] px-3 py-1.5 text-xs font-semibold ${
                            difficultyFilter === level
                                ? 'bg-[var(--accent)] text-white'
                                : 'bg-[var(--surface-muted)] text-[var(--muted)]'
                        }`}
                    >
                        {level}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <SkeletonGrid count={4} />
            ) : loadError ? (
                <EmptyState title="Treks unavailable" description={loadError} />
            ) : filteredTreks.length === 0 ? (
                <EmptyState
                    title="No treks found"
                    description={
                        searchTerm || difficultyFilter !== 'All'
                            ? 'Nothing matched your filters. Try another search or difficulty.'
                            : 'Trek data will appear here once seeded.'
                    }
                />
            ) : (
                <div className="grid gap-5 sm:grid-cols-2">
                    {filteredTreks.map((trek) => {
                        const href = isAuthenticated
                            ? planHref(trek)
                            : `/login?next=${encodeURIComponent(planHref(trek))}`;
                        return (
                            <Card
                                key={trek.id}
                                className="flex flex-col transition hover:border-[var(--accent)]/35"
                            >
                                <div className="mb-5 flex items-center justify-between">
                                    <Badge variant={getDifficultyVariant(trek.difficulty)}>
                                        {trek.difficulty}
                                    </Badge>
                                </div>
                                <h3 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
                                    {trek.trek_name}
                                </h3>
                                <div className="mt-6 grid grid-cols-2 gap-4 border-t border-[var(--border)] pt-5">
                                    <div>
                                        <p className="text-xs font-medium text-[var(--muted)]">
                                            Max altitude
                                        </p>
                                        <p className="mt-1 text-base font-semibold">
                                            {trek.max_altitude.toLocaleString()} m
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-[var(--muted)]">
                                            Typical duration
                                        </p>
                                        <p className="mt-1 text-base font-semibold">
                                            {trek.duration_days} days
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-5">
                                    <Link href={href}>
                                        <Button fullWidth variant="primary">
                                            Plan this trek
                                        </Button>
                                    </Link>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </PageContainer>
    );
}
