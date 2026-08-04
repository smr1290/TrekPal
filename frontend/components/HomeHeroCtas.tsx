'use client';

import Link from 'next/link';
import Button from '@/components/Button';
import { useAuth } from '@/context/AuthContext';

export default function HomeHeroCtas() {
    const { isAuthenticated } = useAuth();

    if (isAuthenticated) {
        return (
            <div className="btn-row mt-9 flex-col sm:flex-row">
                <Link href="/dashboard" className="btn-link w-full sm:w-auto">
                    <Button
                        size="lg"
                        className="w-full min-w-48 bg-white text-[var(--accent-deep)] shadow-[0_12px_28px_rgb(0_0_0_/0.2)] hover:bg-white/90 sm:w-auto"
                    >
                        Open dashboard
                    </Button>
                </Link>
                <Link href="/planner" className="btn-link w-full sm:w-auto">
                    <Button
                        size="lg"
                        variant="outline"
                        className="w-full min-w-48 border-white/35 bg-transparent text-white hover:border-white/55 hover:bg-white/10 sm:w-auto"
                    >
                        Plan my trek
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="btn-row mt-9 flex-col sm:flex-row">
            <Link href="/signup" className="btn-link w-full sm:w-auto">
                <Button
                    size="lg"
                    className="w-full min-w-48 bg-white text-[var(--accent-deep)] shadow-[0_12px_28px_rgb(0_0_0_/0.2)] hover:bg-white/90 sm:w-auto"
                >
                    Meet your buddy
                </Button>
            </Link>
            <Link href="/treks" className="btn-link w-full sm:w-auto">
                <Button
                    size="lg"
                    variant="outline"
                    className="w-full min-w-48 border-white/35 bg-transparent text-white hover:border-white/55 hover:bg-white/10 sm:w-auto"
                >
                    Explore treks
                </Button>
            </Link>
        </div>
    );
}
