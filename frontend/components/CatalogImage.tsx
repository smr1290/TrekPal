'use client';

import React, { useState } from 'react';

type CatalogImageProps = {
    src?: string | null;
    alt: string;
    fallbackLabel?: string;
    className?: string;
    imgClassName?: string;
};

/** Image with graceful fallback when the catalog asset is missing. */
export default function CatalogImage({
    src,
    alt,
    fallbackLabel,
    className = '',
    imgClassName = 'h-full w-full object-cover',
}: CatalogImageProps) {
    const [failed, setFailed] = useState(false);
    const showImage = Boolean(src) && !failed;

    return (
        <div
            className={`flex items-center justify-center overflow-hidden bg-[var(--accent-soft)] text-sm font-medium text-[var(--accent)] ${className}`}
        >
            {showImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={src as string}
                    alt={alt}
                    className={imgClassName}
                    onError={() => setFailed(true)}
                />
            ) : (
                <span className="px-4 text-center">{fallbackLabel || alt}</span>
            )}
        </div>
    );
}
