'use client';

import Link from 'next/link';
import Button from '@/components/Button';
import { useAuth } from '@/context/AuthContext';

export default function HomeHeroCtas() {
    const { isAuthenticated } = useAuth();

    if (isAuthenticated) {
        return (
            <div className="anim-rise-delay mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/planner">
                    <Button size="lg" className="min-w-44">
                        Plan my trek
                    </Button>
                </Link>
                <Link href="/history">
                    <Button
                        size="lg"
                        variant="outline"
                        className="min-w-44 border-white/40 bg-white/10 text-white hover:bg-white/20"
                    >
                        My plans
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="anim-rise-delay mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/signup">
                <Button size="lg" className="min-w-44">
                    Start packing
                </Button>
            </Link>
            <Link href="/treks">
                <Button
                    size="lg"
                    variant="outline"
                    className="min-w-44 border-white/40 bg-white/10 text-white hover:bg-white/20"
                >
                    Explore treks
                </Button>
            </Link>
        </div>
    );
}
