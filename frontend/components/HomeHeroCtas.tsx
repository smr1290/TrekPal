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
                    <Button size="lg" variant="onDark" className="w-full min-w-48 sm:w-auto">
                        Open dashboard
                    </Button>
                </Link>
                <Link href="/planner" className="btn-link w-full sm:w-auto">
                    <Button
                        size="lg"
                        variant="onDarkOutline"
                        className="w-full min-w-48 sm:w-auto"
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
                <Button size="lg" variant="onDark" className="w-full min-w-48 sm:w-auto">
                    Meet your buddy
                </Button>
            </Link>
            <Link href="/treks" className="btn-link w-full sm:w-auto">
                <Button size="lg" variant="onDarkOutline" className="w-full min-w-48 sm:w-auto">
                    Explore treks
                </Button>
            </Link>
        </div>
    );
}
