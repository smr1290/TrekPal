'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

type RevealProps = {
    children: ReactNode;
    className?: string;
    delay?: number;
    y?: number;
    once?: boolean;
};

/** Scroll-triggered rise/fade — the core premium motion primitive. */
export default function Reveal({
    children,
    className = '',
    delay = 0,
    y = 28,
    once = true,
}: RevealProps) {
    const reduce = useReducedMotion();

    if (reduce) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, y }}
            whileInView={{ opacity: 1, y: 0 }}
            // Positive amount + no negative margin: mobile Safari often never
            // fires whileInView with margin: '-8%', leaving content invisible.
            viewport={{ once, amount: 0.12 }}
            transition={{
                duration: 0.7,
                delay,
                ease: [0.22, 1, 0.36, 1],
            }}
        >
            {children}
        </motion.div>
    );
}

type StaggerProps = {
    children: ReactNode;
    className?: string;
    stagger?: number;
};

/**
 * Stagger children on mount (not whileInView).
 * Catalog grids must be visible immediately on phones — scroll-triggered
 * opacity:0 left articles/treks looking "broken" or empty.
 */
export function Stagger({ children, className = '', stagger = 0.08 }: StaggerProps) {
    const reduce = useReducedMotion();

    if (reduce) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            className={className}
            initial="hidden"
            animate="show"
            variants={{
                hidden: {},
                show: {
                    transition: { staggerChildren: stagger },
                },
            }}
        >
            {children}
        </motion.div>
    );
}

export function StaggerItem({
    children,
    className = '',
}: {
    children: ReactNode;
    className?: string;
}) {
    const reduce = useReducedMotion();

    if (reduce) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            className={className}
            variants={{
                hidden: { opacity: 0, y: 16 },
                show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
                },
            }}
        >
            {children}
        </motion.div>
    );
}
