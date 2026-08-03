'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
}

export default function Button({
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    children,
    className = '',
    disabled,
    type = 'button',
    ...props
}: ButtonProps) {
    const reduce = useReducedMotion();

    const base =
        'btn-shine relative inline-flex items-center justify-center overflow-hidden font-semibold tracking-wide rounded-[var(--radius-sm)] transition-colors duration-200 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]';

    const variants = {
        primary:
            'bg-[var(--accent)] text-[var(--accent-on)] hover:bg-[var(--accent-hover)] shadow-[0_10px_24px_rgb(20_102_73_/0.28)] hover:shadow-[0_14px_30px_rgb(20_102_73_/0.34)]',
        secondary:
            'bg-[var(--accent-soft)] text-[var(--accent)] hover:brightness-[0.97] shadow-[0_1px_0_rgb(255_255_255_/0.5)_inset]',
        outline:
            'bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] hover:border-[var(--accent)]/45 hover:bg-[var(--surface-muted)]',
        ghost: 'bg-transparent text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-muted)]',
        danger: 'bg-[var(--danger)] text-white hover:brightness-110',
    };

    const sizes = {
        sm: 'h-9 px-3.5 text-xs',
        md: 'h-11 px-5 text-sm',
        lg: 'h-12 px-8 text-[0.95rem]',
    };

    return (
        <motion.button
            type={type}
            disabled={disabled}
            whileHover={reduce || disabled ? undefined : { scale: 1.025 }}
            whileTap={reduce || disabled ? undefined : { scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 420, damping: 26 }}
            className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
            {...props}
        >
            <span className="relative z-[1]">{children}</span>
        </motion.button>
    );
}
