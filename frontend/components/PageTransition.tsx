'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

/** Soft fade when navigating between pages. */
export default function PageTransition({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const reduce = useReducedMotion();

    if (reduce) {
        return <>{children}</>;
    }

    return (
        <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
            {children}
        </motion.div>
    );
}
