'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import Badge from '@/components/Badge';
import Button from '@/components/Button';
import Card from '@/components/Card';
import CatalogImage from '@/components/CatalogImage';
import PageContainer from '@/components/PageContainer';
import { EmptyState, SkeletonGrid } from '@/components/ui';
import { trekApi } from '@/lib/api';
import type { TrekHistoryDetail, RecommendedGearItem } from '@/lib/types';
import { getRiskVariant, getGearPriorityVariant } from '@/lib/badgeHelpers';

export default function HistoryDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [detail, setDetail] = useState<TrekHistoryDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

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
            void fetchDetail();
        }
    }, [params.id]);

    const handleDelete = async () => {
        if (!detail || !params.id) return;
        const confirmed = window.confirm(
            `Delete the packing checklist “${detail.trek}”? This cannot be undone.`
        );
        if (!confirmed) return;

        setDeleteError(null);
        setIsDeleting(true);
        try {
            await trekApi.deleteHistory(Number(params.id));
            router.push('/history');
        } catch (error) {
            console.error('Failed to delete checklist:', error);
            setDeleteError('Could not delete this checklist. Please try again.');
            setIsDeleting(false);
        }
    };

    return (
        <ProtectedRoute>
            <PageContainer>
                <button
                    type="button"
                    onClick={() => router.push('/history')}
                    className="mb-8 text-sm font-semibold text-[var(--muted)] hover:text-[var(--accent)]"
                >
                    ← Back to my plans
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
                                        Checklist ·{' '}
                                        {new Date(detail.date || Date.now()).toLocaleDateString()}
                                    </p>
                                    <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight">
                                        {detail.trek}
                                    </h1>
                                    {!detail.destination?.trim() && (
                                        <p className="mt-2 text-sm text-[var(--muted)]">
                                            Older save · no destination was recorded when this
                                            checklist was created.
                                        </p>
                                    )}
                                    {detail.trek_type && (
                                        <Badge variant="info" className="mt-4">
                                            {detail.trek_type}
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex flex-col gap-4 md:items-end">
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
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="text-[var(--danger)] hover:border-[var(--danger)]"
                                        disabled={isDeleting}
                                        onClick={() => void handleDelete()}
                                    >
                                        {isDeleting ? 'Deleting…' : 'Delete checklist'}
                                    </Button>
                                    {deleteError && (
                                        <p className="text-sm text-[var(--danger)]" role="alert">
                                            {deleteError}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
                                {[
                                    { label: 'Season', value: detail.season },
                                    { label: 'Duration', value: `${detail.duration} days` },
                                    {
                                        label: 'Altitude',
                                        value: detail.input_altitude
                                            ? `${detail.input_altitude.toLocaleString()} m`
                                            : '—',
                                    },
                                    {
                                        label: 'Heuristic',
                                        value: detail.heuristic_version || 'legacy',
                                    },
                                ].map((item) => (
                                    <div key={item.label}>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
                                            {item.label}
                                        </p>
                                        <p className="mt-1 font-semibold">{item.value}</p>
                                    </div>
                                ))}
                            </div>

                            {(detail.risk_factors || []).length > 0 && (
                                <div className="mt-8 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-4">
                                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--accent)]">
                                        How we calculated this
                                    </p>
                                    <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-[var(--muted)]">
                                        {detail.risk_factors!.map((factor) => (
                                            <li key={factor}>{factor}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </Card>

                        <section>
                            <h2 className="mb-5 text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
                                Packing checklist
                            </h2>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {(detail.recommended_gear || []).map(
                                    (gear: RecommendedGearItem, index: number) => (
                                        <Card key={index} className="overflow-hidden p-0">
                                            <CatalogImage
                                                src={gear.photo_url}
                                                alt={gear.gear_name}
                                                fallbackLabel={gear.category || 'Gear'}
                                                className="h-36 w-full"
                                            />
                                            <div className="p-5">
                                                <div className="mb-3 flex flex-wrap gap-2">
                                                    {gear.priority && (
                                                        <Badge
                                                            variant={getGearPriorityVariant(
                                                                gear.priority
                                                            )}
                                                        >
                                                            {gear.priority}
                                                        </Badge>
                                                    )}
                                                    {gear.category && (
                                                        <Badge variant="default">
                                                            {gear.category}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <h3 className="text-lg font-semibold">
                                                    {gear.gear_name}
                                                </h3>
                                                {gear.quantity && (
                                                    <p className="mt-1 text-xs font-medium">
                                                        Pack: {gear.quantity}
                                                    </p>
                                                )}
                                                {gear.reason && (
                                                    <p className="mt-2 text-sm">{gear.reason}</p>
                                                )}
                                                {gear.rent_hint && (
                                                    <p className="mt-2 text-sm text-[var(--muted)]">
                                                        Nepal tip: {gear.rent_hint}
                                                    </p>
                                                )}
                                                {gear.description && (
                                                    <p className="mt-2 text-sm text-[var(--muted)]">
                                                        {gear.description}
                                                    </p>
                                                )}
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
