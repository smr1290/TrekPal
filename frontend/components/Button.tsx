'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/** Omit React drag/animation handlers that clash with Framer Motion's props (React 19 + build). */
type NativeButtonProps = Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart' | 'onAnimationEnd'
>;

interface ButtonProps extends NativeButtonProps {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'onDark' | 'onDarkOutline';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    /** Communicates in-flight submit (R8 motion-as-feedback). */
    loading?: boolean;
}

/**
 * Colors live in globals.css (.btn-*) so Tailwind utility order cannot
 * make label text match the background (invisible buttons).
 */
export default function Button({
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    loading = false,
    children,
    className = '',
    disabled,
    type = 'button',
    ...props
}: ButtonProps) {
    const reduce = useReducedMotion();
    const isDisabled = disabled || loading;

    const variantClass = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        outline: 'btn-outline',
        ghost: 'btn-ghost',
        danger: 'btn-danger',
        onDark: 'btn-on-dark',
        onDarkOutline: 'btn-on-dark-outline',
    }[variant];

    const sizeClass = {
        sm: 'btn-sm',
        md: 'btn-md',
        lg: 'btn-lg',
    }[size];

    return (
        <motion.button
            type={type}
            disabled={isDisabled}
            aria-busy={loading || undefined}
            whileTap={reduce || isDisabled ? undefined : { scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 420, damping: 26 }}
            className={`btn ${variantClass} ${sizeClass} ${fullWidth ? 'btn-block' : ''} ${className}`}
            {...props}
        >
            <span className="btn-label">
                {loading ? <span className="btn-spinner" aria-hidden /> : null}
                {children}
            </span>
        </motion.button>
    );
}
