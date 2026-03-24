'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Badge from '@/components/Badge';
import { trekApi } from '@/lib/api';

export default function DashboardPage() {
    const { user } = useAuth();
    const [recentHistory, setRecentHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!user) return;

            try {
                const history = await trekApi.getHistory(user.id);
                setRecentHistory(history.slice(0, 3)); // Get last 3
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
                    {/* Welcome Section */}
                    <div className="mb-12">
                        <h1 className="text-4xl font-bold mb-2 text-[var(--foreground)]">
                            Welcome back, {user?.full_name}! 🏔️
                        </h1>
                        <p className="text-xl text-[var(--muted)]">
                            Experience Level: <span className="font-semibold text-[var(--primary)]">{user?.experience_level}</span>
                        </p>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid md:grid-cols-3 gap-6 mb-12">
                        <Link href="/prepare" className="block">
                            <Card hover className="text-center h-full">
                                <div className="text-5xl mb-4">🎯</div>
                                <h3 className="text-xl font-semibold mb-2 text-[var(--foreground)]">Prepare New Trek</h3>
                                <p className="text-[var(--muted)]">Get personalized recommendations</p>
                            </Card>
                        </Link>

                        <Link href="/history" className="block">
                            <Card hover className="text-center h-full">
                                <div className="text-5xl mb-4">📜</div>
                                <h3 className="text-xl font-semibold mb-2 text-[var(--foreground)]">View History</h3>
                                <p className="text-[var(--muted)]">See your past preparations</p>
                            </Card>
                        </Link>

                        <Link href="/gear" className="block">
                            <Card hover className="text-center h-full">
                                <div className="text-5xl mb-4">🎒</div>
                                <h3 className="text-xl font-semibold mb-2 text-[var(--foreground)]">Browse Gear</h3>
                                <p className="text-[var(--muted)]">Explore all available gear</p>
                            </Card>
                        </Link>
                    </div>

                    {/* Recent Trek History */}
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-3xl font-bold text-[var(--foreground)]">Recent Preparations</h2>
                            <Link href="/history">
                                <Button variant="outline" size="sm">View All</Button>
                            </Link>
                        </div>

                        {isLoading ? (
                            <Card>
                                <p className="text-center text-[var(--muted)] py-8">Loading...</p>
                            </Card>
                        ) : recentHistory.length === 0 ? (
                            <Card>
                                <div className="text-center py-12">
                                    <p className="text-xl text-[var(--muted)] mb-4">No trek preparations yet</p>
                                    <Link href="/prepare">
                                        <Button>Prepare Your First Trek</Button>
                                    </Link>
                                </div>
                            </Card>
                        ) : (
                            <div className="grid md:grid-cols-3 gap-6">
                                {recentHistory.map((item) => (
                                    <Link key={item.history_id} href={`/history/${item.history_id}`}>
                                        <Card hover>
                                            <div className="mb-3">
                                                <Badge variant={getRiskBadgeVariant(item.risk_level)}>
                                                    {item.risk_level} Risk
                                                </Badge>
                                            </div>
                                            <h3 className="text-xl font-semibold mb-2 text-[var(--foreground)]">
                                                {item.trek_name}
                                            </h3>
                                            <div className="space-y-1 text-sm text-[var(--muted)]">
                                                <p>Season: {item.season}</p>
                                                <p>Duration: {item.duration} days</p>
                                                <p className="text-xs">{new Date(item.date).toLocaleDateString()}</p>
                                            </div>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
