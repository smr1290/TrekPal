'use client';

import React, { useEffect, useState } from 'react';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import Input from '@/components/Input';
import PageContainer from '@/components/PageContainer';
import { PageHeader, EmptyState, SkeletonGrid } from '@/components/ui';
import { trekApi } from '@/lib/api';
import type { Trek } from '@/lib/types';
import { getDifficultyVariant } from '@/lib/badgeHelpers';

export default function TreksPage() {
    const [treks, setTreks] = useState<Trek[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchTreks = async () => {
            try {
                const data = await trekApi.listTreks();
                setTreks(data || []);
            } catch (error) {
                console.error('Failed to fetch treks:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTreks();
    }, []);

    const filteredTreks = (treks || []).filter((trek) =>
        trek.trek_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <PageContainer>
            <PageHeader
                title="Trail guide"
                description="Popular routes with altitude, duration, and difficulty — your map before the map."
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

            {isLoading ? (
                <SkeletonGrid count={4} />
            ) : filteredTreks.length === 0 ? (
                <EmptyState
                    title="No treks found"
                    description={
                        searchTerm
                            ? `Nothing matched “${searchTerm}”. Try another name.`
                            : 'Trek data will appear here once seeded.'
                    }
                />
            ) : (
                <div className="grid gap-5 sm:grid-cols-2">
                    {filteredTreks.map((trek) => (
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
                        </Card>
                    ))}
                </div>
            )}
        </PageContainer>
    );
}
