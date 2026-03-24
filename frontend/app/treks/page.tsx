'use client';

import React, { useEffect, useState } from 'react';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import Input from '@/components/Input';
import { trekApi } from '@/lib/api';

export default function TreksPage() {
    const [treks, setTreks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchTreks = async () => {
            try {
                const data = await trekApi.listTreks();
                setTreks(data);
            } catch (error) {
                console.error('Failed to fetch treks:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTreks();
    }, []);

    const getDifficultyVariant = (difficulty: string) => {
        switch (difficulty.toLowerCase()) {
            case 'easy': return 'success';
            case 'moderate': return 'warning';
            case 'hard': return 'danger';
            default: return 'default';
        }
    };

    const filteredTreks = treks.filter((trek) =>
        trek.trek_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[var(--background)] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-bold mb-2 text-[var(--foreground)]">Explore Treks</h1>
                            <p className="text-xl text-[var(--muted)]">
                                Discover amazing trekking destinations
                            </p>
                        </div>

                        {/* Search */}
                        <div className="w-full sm:max-w-md">
                            <Input
                                type="text"
                                placeholder="Search treks..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <Card>
                        <p className="text-center text-[var(--muted)] py-8">Loading treks...</p>
                    </Card>
                ) : filteredTreks.length === 0 ? (
                    <Card>
                        <p className="text-center text-[var(--muted)] py-8">
                            {searchTerm ? 'No treks found matching your search' : 'No treks available'}
                        </p>
                    </Card>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTreks.map((trek) => (
                            <Card key={trek.id} hover>
                                <div className="mb-3">
                                    <Badge variant={getDifficultyVariant(trek.difficulty)}>
                                        {trek.difficulty}
                                    </Badge>
                                </div>
                                <h3 className="text-2xl font-semibold mb-3 text-[var(--foreground)]">
                                    {trek.trek_name}
                                </h3>
                                <div className="space-y-2 text-[var(--muted)]">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">⛰️</span>
                                        <span>Max Altitude: {trek.max_altitude.toLocaleString()}m</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">📅</span>
                                        <span>Duration: {trek.duration_days} days</span>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
