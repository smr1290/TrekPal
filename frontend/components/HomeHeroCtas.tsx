'use client';

import Link from 'next/link';
import Button from '@/components/Button';
import { useAuth } from '@/context/AuthContext';

export default function HomeHeroCtas() {
    const { isAuthenticated } = useAuth();

    if (isAuthenticated) {
        return (
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link href="/dashboard">
                    <Button
                        size="lg"
                        className="min-w-48 bg-white text-[var(--accent-deep)] shadow-[0_12px_28px_rgb(0_0_0_/0.2)] hover:bg-white/90"
                    >
                        Open dashboard
                    </Button>
                </Link>
                <Link href="/planner">
                    <Button
                        size="lg"
                        variant="outline"
                        className="min-w-48 border-white/35 bg-transparent text-white hover:border-white/55 hover:bg-white/10"
                    >
                        Plan my trek
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="/signup">
                <Button
                    size="lg"
                    className="min-w-48 bg-white text-[var(--accent-deep)] shadow-[0_12px_28px_rgb(0_0_0_/0.2)] hover:bg-white/90"
                >
                    Meet your buddy
                </Button>
            </Link>
            <Link href="/treks">
                <Button
                    size="lg"
                    variant="outline"
                    className="min-w-48 border-white/35 bg-transparent text-white hover:border-white/55 hover:bg-white/10"
                >
                    Explore treks
                </Button>
            </Link>
        </div>
    );
}
