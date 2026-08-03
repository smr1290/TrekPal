'use client';

import Link from 'next/link';
import Button from '@/components/Button';
import { useAuth } from '@/context/AuthContext';

export default function HomeBottomCta() {
    const { isAuthenticated } = useAuth();

    return (
        <div className="relative mx-auto max-w-xl text-center text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/65">
                TrekPal
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold sm:text-4xl">
                A buddy for every ridge.
            </h2>
            <p className="mt-4 text-white/80">
                {isAuthenticated
                    ? 'Your hub for plans, treks, and packing — continue from the dashboard.'
                    : 'Create a free account and prepare your next Nepal trek with calmer confidence.'}
            </p>
            <div className="mt-8">
                {isAuthenticated ? (
                    <Link href="/dashboard">
                        <Button size="lg">Open dashboard</Button>
                    </Link>
                ) : (
                    <Link href="/signup">
                        <Button size="lg">Create free account</Button>
                    </Link>
                )}
            </div>
        </div>
    );
}
