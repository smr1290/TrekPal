import React from 'react';

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
    ...props
}: ButtonProps) {
    const base =
        'inline-flex items-center justify-center font-semibold rounded-[var(--radius)] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]';

    const variants = {
        primary: 'bg-[var(--accent)] text-[var(--accent-on)] hover:bg-[var(--accent-hover)]',
        secondary: 'bg-[var(--accent-soft)] text-[var(--accent)] hover:brightness-95',
        outline:
            'bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface-muted)]',
        ghost: 'bg-transparent text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-muted)]',
        danger: 'bg-[var(--danger)] text-white hover:brightness-110',
    };

    const sizes = {
        sm: 'h-9 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
    };

    return (
        <button
            className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
