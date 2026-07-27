'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import Badge from '@/components/Badge';
import Card from '@/components/Card';
import PageContainer from '@/components/PageContainer';
import { EmptyState, SkeletonGrid } from '@/components/ui';
import { trekApi } from '@/lib/api';
import type { TrekHistoryDetail, RecommendedGearItem } from '@/lib/types';
import { getRiskVariant } from '@/lib/badgeHelpers';

export default function HistoryDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [detail, setDetail] = useState<TrekHistoryDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const data = await trekApi.getHistoryDetail(Number(params.id));
                setDetail(data);
            } catch (error) {
                console.error('Failed to fetch history detail:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (params.id) {
            fetchDetail();
        }
    }, [params.id]);

    return (
        <ProtectedRoute>
            <PageContainer>
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="mb-8 text-sm font-semibold text-[var(--muted)] hover:text-[var(--accent)]"
                >
                    ← Back to history
                </button>

                {isLoading ? (
                    <SkeletonGrid count={3} columns="md:grid-cols-3" />
                ) : !detail ? (
                    <EmptyState
                        title="Plan not found"
                        description="This preparation may have been removed or you don’t have access."
                    />
                ) : (
                    <div className="flex flex-col gap-10">
                        <Card className="p-6 sm:p-8">
                            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                                <div className="max-w-xl">
                                    <p className="text-xs font-medium text-[var(--muted)]">
                                        Planned{' '}
                                        {new Date(detail.date || Date.now()).toLocaleDateString()}
                                    </p>
                                    <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight">
                                        {detail.trek}
                                    </h1>
                                    <Badge variant="info" className="mt-4">
                                        Saved preparation
                                    </Badge>
                                </div>
                                <div className="md:text-right">
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                                        Safety risk
                                    </p>
                                    <Badge
                                        variant={getRiskVariant(detail.risk_level)}
                                        className="px-4 py-1.5 text-sm"
                                    >
                                        {detail.risk_level} risk
                                    </Badge>
                                </div>
                            </div>

                            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
                                {[
                                    { label: 'Season', value: detail.season },
                                    { label: 'Duration', value: `${detail.duration} days` },
                                    {
                                        label: 'Altitude',
                                        value: `${detail.input_altitude?.toLocaleString() || '—'} m`,
                                    },
                                    {
                                        label: 'Gear items',
                                        value: String(detail.recommended_gear?.length || 0),
                                    },
                                ].map((stat) => (
                                    <div
                                        key={stat.label}
                                        className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-muted)] p-4"
                                    >
                                        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                                            {stat.label}
                                        </p>
                                        <p className="mt-1 text-lg font-semibold">{stat.value}</p>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <section>
                            <h2 className="mb-5 text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
                                Recommended gear
                            </h2>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {(detail.recommended_gear || []).map(
                                    (gear: RecommendedGearItem, index: number) => (
                                        <Card key={index} className="overflow-hidden p-0">
                                            <div className="flex h-36 items-center justify-center bg-[var(--accent-soft)] text-sm font-medium text-[var(--accent)]">
                                                {gear.photo_url ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={gear.photo_url}
                                                        alt={gear.gear_name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    gear.category || 'Gear'
                                                )}
                                            </div>
                                            <div className="p-5">
                                                {gear.category && (
                                                    <Badge variant="default" className="mb-3">
                                                        {gear.category}
                                                    </Badge>
                                                )}
                                                <h3 className="text-lg font-semibold">
                                                    {gear.gear_name}
                                                </h3>
                                                <p className="mt-2 text-sm text-[var(--muted)]">
                                                    {gear.description || 'No description available.'}
                                                </p>
                                            </div>
                                        </Card>
                                    )
                                )}
                            </div>
                        </section>
                    </div>
                )}
            </PageContainer>
        </ProtectedRoute>
    );
}
