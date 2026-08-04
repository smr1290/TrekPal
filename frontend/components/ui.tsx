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
    <header className="mb-12 flex flex-col gap-6 border-b border-[var(--border)] pb-10 sm:flex-row sm:items-center sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h1 className="display-title text-4xl text-[var(--foreground)] sm:text-5xl md:text-[3.25rem]">
          {title}
        </h1>
        {description && (
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[var(--muted)] sm:text-lg">
            {description}
          </p>
        )}
      </div>
      {action && <div className="flex shrink-0 items-center">{action}</div>}
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
    <div className="flex flex-col items-center rounded-[var(--radius-lg)] border border-dashed border-[var(--border-strong)] bg-[var(--surface)]/70 px-6 py-20 text-center shadow-[var(--shadow)]">
      <div className="mb-5 h-px w-12 bg-[var(--accent)]/50" aria-hidden />
      <h3 className="display-title text-xl text-[var(--foreground)]">{title}</h3>
      {description && (
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-[var(--muted)]">{description}</p>
      )}
      {action && <div className="mt-7">{action}</div>}
    </div>
  );
}

export function LoadingBlock({ label = "Loading…" }: { label?: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-4 py-16 text-[var(--muted)]"
      aria-busy="true"
      aria-label={label}
    >
      <div className="h-10 w-40 skeleton-shimmer rounded-[var(--radius-sm)]" />
      <div className="h-3 w-28 skeleton-shimmer rounded" />
      <p className="text-sm font-medium tracking-wide">{label}</p>
    </div>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <p className="state-error mb-4" role="alert">
      {message}
    </p>
  );
}

export function SuccessBanner({ message }: { message: string }) {
  return (
    <p className="state-success mb-4" role="status">
      {message}
    </p>
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
    <div className={`grid gap-6 ${columns}`} aria-busy="true" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)]"
        >
          <div className="h-40 skeleton-shimmer" />
          <div className="space-y-3 p-6">
            <div className="h-3 w-20 skeleton-shimmer rounded" />
            <div className="h-5 w-2/3 skeleton-shimmer rounded" />
            <div className="h-3 w-full skeleton-shimmer rounded" />
            <div className="h-3 w-4/5 skeleton-shimmer rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)]"
        >
          <div className="h-4 w-1/2 skeleton-shimmer rounded" />
          <div className="mt-3 h-3 w-1/3 skeleton-shimmer rounded" />
        </div>
      ))}
    </div>
  );
}
