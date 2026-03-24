// Reusable Button Component

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    children: React.ReactNode;
}

export default function Button({
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    children,
    className = '',
    disabled,
    ...props
}: ButtonProps) {
    const baseStyles = 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variantStyles = {
        primary: 'bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] focus:ring-[var(--primary)] shadow-md hover:shadow-lg',
        secondary: 'bg-[var(--secondary)] text-white hover:bg-[var(--secondary-dark)] focus:ring-[var(--secondary)] shadow-md hover:shadow-lg',
        outline: 'border-2 border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white focus:ring-[var(--primary)]',
        danger: 'bg-[var(--danger)] text-white hover:opacity-90 focus:ring-[var(--danger)] shadow-md hover:shadow-lg',
    };

    const sizeStyles = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-5 py-2.5 text-base',
        lg: 'px-7 py-3.5 text-lg',
    };

    const widthStyle = fullWidth ? 'w-full' : '';

    return (
        <button
            className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
}
