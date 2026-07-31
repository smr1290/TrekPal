'use client';

import Link from 'next/link';
import Button from '@/components/Button';
import { useAuth } from '@/context/AuthContext';

export default function HomeBottomCta() {
    const { isAuthenticated } = useAuth();

    return (
        <div className="relative mx-auto max-w-xl text-center text-white">
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold sm:text-4xl">
                Walk lighter. Plan clearer.
            </h2>
            <p className="mt-4 text-white/80">
                {isAuthenticated
                    ? 'Jump back into your packing checklist or full itinerary.'
                    : 'Create a free account and prepare your next trek in minutes.'}
            </p>
            <div className="mt-8">
                {isAuthenticated ? (
                    <Link href="/planner">
                        <Button size="lg">Continue planning</Button>
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
