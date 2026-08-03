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
        'inline-flex items-center justify-center font-semibold tracking-wide rounded-[var(--radius-sm)] transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] active:scale-[0.98]';

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
        <button
            className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
