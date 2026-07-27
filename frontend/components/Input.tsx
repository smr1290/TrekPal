import React, { useId } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export default function Input({ label, error, className = '', id, ...props }: InputProps) {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;

    return (
        <div className="mb-4 flex flex-col gap-1.5">
            {label && (
                <label htmlFor={inputId} className="text-sm font-medium text-[var(--muted)]">
                    {label}
                </label>
            )}
            <input
                id={inputId}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? errorId : undefined}
                className={`h-11 rounded-[var(--radius)] border bg-[var(--surface)] px-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]/70 focus:border-[var(--accent)] ${
                    error ? 'border-[var(--danger)]' : 'border-[var(--border)]'
                } ${className}`}
                {...props}
            />
            {error && (
                <span id={errorId} className="text-xs text-[var(--danger)]">
                    {error}
                </span>
            )}
        </div>
    );
}
