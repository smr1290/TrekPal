'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import Button from '@/components/Button';
import { trekApi } from '@/lib/api';

export default function HistoryPage() {
    const { user } = useAuth();
    const [history, setHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!user) return;

            try {
                const data = await trekApi.getHistory(user.id);
                setHistory(data);
            } catch (error) {
                console.error('Failed to fetch history:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();
    }, [user]);

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
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold mb-2 text-[var(--foreground)]">Trek History</h1>
                        <p className="text-xl text-[var(--muted)]">
                            View all your past trek preparations
                        </p>
                    </div>

                    {isLoading ? (
                        <Card>
                            <p className="text-center text-[var(--muted)] py-8">Loading history...</p>
                        </Card>
                    ) : history.length === 0 ? (
                        <Card>
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">🏔️</div>
                                <p className="text-xl text-[var(--muted)] mb-4">No trek preparations yet</p>
                                <Link href="/prepare">
                                    <Button size="lg">Prepare Your First Trek</Button>
                                </Link>
                            </div>
                        </Card>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {history.map((item) => (
                                <Link key={item.history_id} href={`/history/${item.history_id}`}>
                                    <Card hover>
                                        <div className="mb-3">
                                            <Badge variant={getRiskBadgeVariant(item.risk_level)}>
                                                {item.risk_level} Risk
                                            </Badge>
                                        </div>
                                       
                                        <div className="space-y-2 text-sm text-[var(--muted)]">
                                            <div className="flex items-center gap-2">
                                                <span>🌤️</span>
                                                <span>Season: {item.season}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span>📅</span>
                                                <span>Duration: {item.duration} days</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span>🕒</span>
                                                <span>{new Date(item.date).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
