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
            viewport={{ once, margin: '-8% 0px' }}
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

/** Staggers child Reveals via container variants. */
export function Stagger({ children, className = '', stagger = 0.08 }: StaggerProps) {
    const reduce = useReducedMotion();

    if (reduce) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            className={className}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-6% 0px' }}
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
                hidden: { opacity: 0, y: 22 },
                show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
                },
            }}
        >
            {children}
        </motion.div>
    );
}
