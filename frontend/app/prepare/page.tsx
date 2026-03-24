'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Input from '@/components/Input';
import Select from '@/components/Select';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import { trekApi } from '@/lib/api';

export default function PrepareTrekPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        trek_type: 'Easy',
        altitude: '',
        season: 'Spring',
        duration: '',
    });
    const [errors, setErrors] = useState<any>({});
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: undefined });
    };

    const validateForm = () => {
        const newErrors: any = {};

        if (!formData.altitude) {
            newErrors.altitude = 'Altitude is required';
        } else if (parseInt(formData.altitude) < 0) {
            newErrors.altitude = 'Altitude must be positive';
        }

        if (!formData.duration) {
            newErrors.duration = 'Duration is required';
        } else if (parseInt(formData.duration) < 1) {
            newErrors.duration = 'Duration must be at least 1 day';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm() || !user) return;

        setIsLoading(true);
        setErrors({});

        try {
            const response = await trekApi.prepareTrek(
                user.id,
                formData.trek_type,
                user.experience_level,
                parseInt(formData.altitude),
                formData.season,
                parseInt(formData.duration)
            );
            setResult(response);
        } catch (error: any) {
            setErrors({ general: error.message || 'Failed to prepare trek. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    const getRiskBadgeVariant = (risk: string) => {
        switch (risk.toLowerCase()) {
            case 'low': return 'success';
            case 'moderate': return 'warning';
            case 'high': return 'danger';
            default: return 'default';
        }
    };

    const trekTypes = [
        { value: 'Easy', label: 'Easy' },
        { value: 'Moderate', label: 'Moderate' },
        { value: 'Hard', label: 'Hard' },
    ];

    const seasons = [
        { value: 'Spring', label: 'Spring' },
        { value: 'Summer', label: 'Summer' },
        { value: 'Autumn', label: 'Autumn' },
        { value: 'Winter', label: 'Winter' },
    ];

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-[var(--background)] py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold mb-2 text-[var(--foreground)]">Prepare Your Trek</h1>
                        <p className="text-xl text-[var(--muted)]">
                            Get personalized gear recommendations and risk assessment
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Form */}
                        <Card>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {errors.general && (
                                    <div className="p-4 bg-red-50 dark:bg-red-900 dark:bg-opacity-30 border border-red-200 dark:border-red-800 rounded-lg">
                                        <p className="text-sm text-red-800 dark:text-red-200">{errors.general}</p>
                                    </div>
                                )}

                                <div className="p-4 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-30 border border-blue-200 dark:border-blue-800 rounded-lg">
                                    <p className="text-sm text-blue-800 dark:text-blue-200">
                                        <strong>Your Experience Level:</strong> {user?.experience_level}
                                    </p>
                                </div>

                                <Select
                                    label="Trek Type"
                                    name="trek_type"
                                    value={formData.trek_type}
                                    onChange={handleChange}
                                    options={trekTypes}
                                    required
                                />

                                <Input
                                    label="Altitude (meters)"
                                    type="number"
                                    name="altitude"
                                    value={formData.altitude}
                                    onChange={handleChange}
                                    error={errors.altitude}
                                    placeholder="e.g., 3500"
                                    required
                                />

                                <Select
                                    label="Season"
                                    name="season"
                                    value={formData.season}
                                    onChange={handleChange}
                                    options={seasons}
                                    required
                                />

                                <Input
                                    label="Duration (days)"
                                    type="number"
                                    name="duration"
                                    value={formData.duration}
                                    onChange={handleChange}
                                    error={errors.duration}
                                    placeholder="e.g., 7"
                                    required
                                />

                                <Button
                                    type="submit"
                                    fullWidth
                                    disabled={isLoading}
                                    size="lg"
                                >
                                    {isLoading ? 'Analyzing...' : 'Get Recommendations'}
                                </Button>
                            </form>
                        </Card>

                        {/* Results */}
                        <div>
                            {result ? (
                                <div className="space-y-6">
                                    {/* Risk Assessment */}
                                    <Card>
                                        <h3 className="text-2xl font-semibold mb-4 text-[var(--foreground)]">
                                            Risk Assessment
                                        </h3>
                                        <div className="flex items-center gap-3">
                                            <Badge variant={getRiskBadgeVariant(result.risk_level)} size="lg">
                                                {result.risk_level} Risk
                                            </Badge>
                                        </div>
                                    </Card>

                                    {/* Recommended Gear */}
                                    <Card>
                                        <h3 className="text-2xl font-semibold mb-4 text-[var(--foreground)]">
                                            Recommended Gear ({result.recommended_gear.length})
                                        </h3>
                                        <div className="space-y-4 max-h-96 overflow-y-auto">
                                            {result.recommended_gear.map((gear: any, index: number) => (
                                                <div
                                                    key={index}
                                                    className="flex gap-4 p-3 rounded-lg border border-[var(--border)] hover:bg-[var(--background)] transition-colors"
                                                >
                                                    {gear.photo_url && (
                                                        <img
                                                            src={gear.photo_url}
                                                            alt={gear.gear_name}
                                                            className="w-16 h-16 object-cover rounded-lg"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"%3E%3Crect fill="%23ddd" width="64" height="64"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3E🎒%3C/text%3E%3C/svg%3E';
                                                            }}
                                                        />
                                                    )}
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-[var(--foreground)]">{gear.gear_name}</h4>
                                                        <p className="text-sm text-[var(--muted)]">{gear.description}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </Card>

                                    <Button
                                        variant="outline"
                                        fullWidth
                                        onClick={() => {
                                            setResult(null);
                                            setFormData({
                                                trek_type: 'Easy',
                                                altitude: '',
                                                season: 'Spring',
                                                duration: '',
                                            });
                                        }}
                                    >
                                        Prepare Another Trek
                                    </Button>
                                </div>
                            ) : (
                                <Card className="h-full flex items-center justify-center">
                                    <div className="text-center text-[var(--muted)]">
                                        <div className="text-6xl mb-4">🏔️</div>
                                        <p>Fill out the form to get your personalized recommendations</p>
                                    </div>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
