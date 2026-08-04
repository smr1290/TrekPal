'use client';

import Link from 'next/link';
import Button from '@/components/Button';
import { useAuth } from '@/context/AuthContext';

export default function HomeBottomCta() {
    const { isAuthenticated } = useAuth();

    return (
        <div className="relative mx-auto max-w-xl text-center text-white">
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-white/55">
                TrekPal
            </p>
            <h2 className="display-title mt-4 text-4xl sm:text-5xl">A buddy for every ridge.</h2>
            <p className="mt-5 text-base leading-relaxed text-white/72">
                {isAuthenticated
                    ? 'Your lodge for plans, treks, and packing — continue from the dashboard.'
                    : 'Create a free account and prepare your next Nepal trek with calmer confidence.'}
            </p>
            <div className="mt-9 flex justify-center">
                {isAuthenticated ? (
                    <Link href="/dashboard" className="btn-link">
                        <Button size="lg" variant="onDark">
                            Open dashboard
                        </Button>
                    </Link>
                ) : (
                    <Link href="/signup" className="btn-link">
                        <Button size="lg" variant="onDark">
                            Create free account
                        </Button>
                    </Link>
                )}
            </div>
        </div>
    );
}
