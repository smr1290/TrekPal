// Reusable Input Component

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export default function Input({
    label,
    error,
    helperText,
    className = '',
    id,
    ...props
}: InputProps) {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
        <div className="w-full">
            {label && (
                <label
                    htmlFor={inputId}
                    className="block text-sm font-medium mb-2 text-[var(--foreground)]"
                >
                    {label}
                </label>
            )}
            <input
                id={inputId}
                className={`
          w-full px-4 py-2.5 rounded-lg border
          bg-[var(--surface)] text-[var(--foreground)]
          border-[var(--border)]
          focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20
          transition-all duration-200
          placeholder:text-[var(--muted)]
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-[var(--danger)] focus:border-[var(--danger)] focus:ring-[var(--danger)]' : ''}
          ${className}
        `}
                {...props}
            />
            {error && (
                <p className="mt-1.5 text-sm text-[var(--danger)]">{error}</p>
            )}
            {helperText && !error && (
                <p className="mt-1.5 text-sm text-[var(--muted)]">{helperText}</p>
            )}
        </div>
    );
}
