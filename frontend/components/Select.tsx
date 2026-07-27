import React, { useId } from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    options: { value: string; label: string }[];
    error?: string;
}

export default function Select({
    label,
    options,
    error,
    className = '',
    id,
    ...props
}: SelectProps) {
    const generatedId = useId();
    const selectId = id || generatedId;
    const errorId = `${selectId}-error`;

    return (
        <div className="mb-4 flex flex-col gap-1.5">
            {label && (
                <label htmlFor={selectId} className="text-sm font-medium text-[var(--muted)]">
                    {label}
                </label>
            )}
            <select
                id={selectId}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? errorId : undefined}
                className={`h-11 cursor-pointer rounded-[var(--radius)] border bg-[var(--surface)] px-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)] ${
                    error ? 'border-[var(--danger)]' : 'border-[var(--border)]'
                } ${className}`}
                {...props}
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {error && (
                <span id={errorId} className="text-xs text-[var(--danger)]">
                    {error}
                </span>
            )}
        </div>
    );
}
