'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import DependencyError from '@/components/DependencyError';
import { LoadingBlock } from '@/components/ui';
import { ApiError, weatherApi } from '@/lib/api';
import type { WeatherForecast } from '@/lib/types';

function formatDay(date: string) {
    try {
        return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        });
    } catch {
        return date;
    }
}

function weatherErrorMessage(err: unknown): string {
    if (err instanceof ApiError) {
        if (err.status === 404) {
            return err.message;
        }
        if (err.status === 502) {
            return (
                err.message ||
                'Open-Meteo weather service is temporarily unavailable. Your packing checklist still works without forecast data.'
            );
        }
        return err.message;
    }
    return 'Could not reach Open-Meteo. Check your connection and try again.';
}

export default function WeatherPanel({ destination }: { destination: string }) {
    const [forecast, setForecast] = useState<WeatherForecast | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [reloadToken, setReloadToken] = useState(0);

    const loadForecast = useCallback(async (query: string, cancelled: () => boolean) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await weatherApi.forecast(query, 7);
            if (!cancelled()) setForecast(data);
        } catch (err) {
            if (cancelled()) return;
            setForecast(null);
            setError(weatherErrorMessage(err));
        } finally {
            if (!cancelled()) setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const query = destination.trim();
        if (query.length < 2) {
            setForecast(null);
            setError(null);
            return;
        }

        let cancelled = false;
        const isCancelled = () => cancelled;

        const timer = window.setTimeout(() => {
            void loadForecast(query, isCancelled);
        }, 350);

        return () => {
            cancelled = true;
            window.clearTimeout(timer);
        };
    }, [destination, reloadToken, loadForecast]);

    const handleRetry = () => setReloadToken((n) => n + 1);

    if (!destination.trim()) return null;

    return (
        <Card className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h3 className="text-sm font-bold uppercase tracking-[0.1em] text-[var(--foreground)]">
                        Trail weather
                    </h3>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                        Open-Meteo forecast for known trek areas — orientation only.
                    </p>
                </div>
                <Link
                    href="/knowledge/trail-safety-basics"
                    className="text-xs font-semibold text-[var(--accent)] hover:underline"
                >
                    Trail safety guide →
                </Link>
            </div>

            {isLoading ? (
                <div className="mt-4">
                    <LoadingBlock label="Loading forecast from Open-Meteo…" />
                </div>
            ) : error ? (
                <DependencyError
                    title="Open-Meteo unavailable"
                    message={error}
                    onRetry={handleRetry}
                    nextActions={[
                        { label: 'Build packing checklist', href: '/planner?tab=checklist' },
                        { label: 'Browse Knowledge', href: '/knowledge' },
                    ]}
                />
            ) : forecast ? (
                <div className="mt-4 space-y-4">
                    <div>
                        <p className="font-semibold">{forecast.destination_label}</p>
                        <p className="mt-1 text-xs text-[var(--muted)]">
                            {forecast.elevation_m != null
                                ? `${forecast.elevation_m.toLocaleString()} m · `
                                : ''}
                            Source: {forecast.source}
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                            {forecast.explanation}
                        </p>
                    </div>

                    {forecast.warnings.length > 0 && (
                        <div className="rounded-[var(--radius)] border border-[var(--warning)]/40 bg-[var(--warning-bg)] px-3 py-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--warning)]">
                                Watch-outs
                            </p>
                            <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-[var(--warning)]">
                                {forecast.warnings.map((w) => (
                                    <li key={w}>{w}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {forecast.days.slice(0, 7).map((day) => (
                            <div
                                key={day.date}
                                className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-muted)] p-3"
                            >
                                <p className="text-xs font-semibold text-[var(--muted)]">
                                    {formatDay(day.date)}
                                </p>
                                <p className="mt-1 text-sm font-semibold">{day.summary}</p>
                                <p className="mt-2 text-sm">
                                    {day.temp_max_c != null ? `${Math.round(day.temp_max_c)}°` : '—'} /{' '}
                                    {day.temp_min_c != null ? `${Math.round(day.temp_min_c)}°` : '—'}
                                </p>
                                <div className="mt-2 flex flex-wrap gap-1">
                                    {day.precipitation_mm != null && day.precipitation_mm > 0 && (
                                        <Badge variant="info">
                                            {day.precipitation_mm.toFixed(1)} mm
                                        </Badge>
                                    )}
                                    {day.snowfall_cm != null && day.snowfall_cm > 0 && (
                                        <Badge variant="warning">
                                            {day.snowfall_cm.toFixed(1)} cm snow
                                        </Badge>
                                    )}
                                    {day.wind_max_kmh != null && day.wind_max_kmh >= 30 && (
                                        <Badge variant="warning">
                                            {Math.round(day.wind_max_kmh)} km/h
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}
        </Card>
    );
}
