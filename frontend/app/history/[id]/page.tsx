'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import Button from '@/components/Button';
import { trekApi } from '@/lib/api';

export default function HistoryDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [detail, setDetail] = useState<any>(null);
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

    const getRiskBadgeVariant = (risk: string) => {
        switch (risk.toLowerCase()) {
            case 'low': return 'success';
            case 'moderate': return 'warning';
            case 'high': return 'danger';
            default: return 'default';
        }
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-[var(--background)] py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    <Button
                        variant="outline"
                        onClick={() => router.back()}
                        className="mb-6"
                    >
                        ← Back
                    </Button>

                    {isLoading ? (
                        <Card>
                            <p className="text-center text-[var(--muted)] py-8">Loading...</p>
                        </Card>
                    ) : !detail ? (
                        <Card>
                            <p className="text-center text-[var(--muted)] py-8">Trek preparation not found</p>
                        </Card>
                    ) : (
                        <div className="space-y-6">
                            {/* Trek Info */}
                            <Card>
                                <h1 className="text-3xl font-bold mb-4 text-[var(--foreground)]">
                                    {detail.trek}
                                </h1>
                                <div className="grid md:grid-cols-3 gap-4 mb-4">
                                    <div>
                                        <p className="text-sm text-[var(--muted)]">Season</p>
                                        <p className="text-lg font-semibold text-[var(--foreground)]">{detail.season}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-[var(--muted)]">Duration</p>
                                        <p className="text-lg font-semibold text-[var(--foreground)]">{detail.duration} days</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-[var(--muted)]">Risk Level</p>
                                        <Badge variant={getRiskBadgeVariant(detail.risk_level)} size="lg">
                                            {detail.risk_level}
                                        </Badge>
                                    </div>
                                </div>
                            </Card>

                            {/* Recommended Gear */}
                            <Card>
                                <h2 className="text-2xl font-bold mb-6 text-[var(--foreground)]">
                                    Recommended Gear ({detail.recommended_gear.length})
                                </h2>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {detail.recommended_gear.map((gear: any, index: number) => (
                                        <div
                                            key={index}
                                            className="flex gap-4 p-4 rounded-lg border border-[var(--border)] hover:bg-[var(--background)] transition-colors"
                                        >
                                            {gear.photo_url && (
                                                <img
                                                    src={gear.photo_url}
                                                    alt={gear.gear_name}
                                                    className="w-20 h-20 object-cover rounded-lg"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect fill="%23ddd" width="80" height="80"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="32"%3E🎒%3C/text%3E%3C/svg%3E';
                                                    }}
                                                />
                                            )}
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-lg text-[var(--foreground)]">
                                                    {gear.gear_name}
                                                </h3>
                                                <p className="text-sm text-[var(--muted)]">
                                                    Category: {gear.category}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
