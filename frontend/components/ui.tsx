import React from "react";

export function PageHeader({
  title,
  description,
  action,
  eyebrow,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  eyebrow?: string;
}) {
  return (
    <header className="mb-10 flex flex-col gap-5 border-b border-[var(--border)] pb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
            {eyebrow}
          </p>
        )}
        <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mt-3 text-base leading-relaxed text-[var(--muted)] sm:text-lg">{description}</p>
        )}
      </div>
      {action}
    </header>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-[var(--radius)] border border-dashed border-[var(--border)] bg-[var(--surface-muted)] px-6 py-16 text-center">
      <h3 className="text-lg font-semibold text-[var(--foreground)]">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-[var(--muted)]">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function LoadingBlock({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-[var(--muted)]">
      <div
        className="h-8 w-8 animate-pulse rounded-full border-2 border-[var(--border)] border-t-[var(--accent)]"
        aria-hidden
      />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}

/** Placeholder cards while trek/gear/history data loads */
export function SkeletonGrid({
  count = 4,
  columns = "sm:grid-cols-2",
}: {
  count?: number;
  columns?: string;
}) {
  return (
    <div className={`grid gap-5 ${columns}`} aria-busy="true" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]"
        >
          <div className="mb-4 h-4 w-20 animate-pulse rounded bg-[var(--border)]" />
          <div className="mb-3 h-7 w-3/4 animate-pulse rounded bg-[var(--border)]" />
          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-[var(--border)] pt-5">
            <div className="h-10 animate-pulse rounded bg-[var(--surface-muted)]" />
            <div className="h-10 animate-pulse rounded bg-[var(--surface-muted)]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col gap-4 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-6 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex-1 space-y-2">
            <div className="h-3 w-32 animate-pulse rounded bg-[var(--border)]" />
            <div className="h-7 w-48 animate-pulse rounded bg-[var(--border)]" />
          </div>
          <div className="flex gap-6">
            <div className="h-10 w-16 animate-pulse rounded bg-[var(--surface-muted)]" />
            <div className="h-10 w-16 animate-pulse rounded bg-[var(--surface-muted)]" />
            <div className="h-10 w-16 animate-pulse rounded bg-[var(--surface-muted)]" />
          </div>
        </div>
      ))}
    </div>
  );
}
