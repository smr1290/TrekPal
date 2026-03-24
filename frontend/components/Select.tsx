// Reusable Select Component

import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: { value: string; label: string }[];
}

export default function Select({
    label,
    error,
    options,
    className = '',
    id,
    ...props
}: SelectProps) {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
        <div className="w-full">
            {label && (
                <label
                    htmlFor={selectId}
                    className="block text-sm font-medium mb-2 text-[var(--foreground)]"
                >
                    {label}
                </label>
            )}
            <select
                id={selectId}
                className={`
          w-full px-4 py-2.5 rounded-lg border
          bg-[var(--surface)] text-[var(--foreground)]
          border-[var(--border)]
          focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-[var(--danger)] focus:border-[var(--danger)] focus:ring-[var(--danger)]' : ''}
          ${className}
        `}
                {...props}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && (
                <p className="mt-1.5 text-sm text-[var(--danger)]">{error}</p>
            )}
        </div>
    );
}
