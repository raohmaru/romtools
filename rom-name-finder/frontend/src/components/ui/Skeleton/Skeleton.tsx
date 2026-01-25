import { memo } from 'react';
import styles from './Skeleton.module.css';

export interface SkeletonProps {
    /**
     * Width of the skeleton element
     */
    width?: string | number;
    /**
     * Height of the skeleton element
     */
    height?: string | number;
    /**
     * Border radius of the skeleton element
     */
    borderRadius?: string | number;
    /**
     * Additional CSS class
     */
    className?: string;
    /**
     * Whether the element is exposed to an accessibility API
     */
    hidden?: boolean;
}

/**
 * Skeleton component for displaying loading placeholders
 */
export const Skeleton = memo(({
    width = '100%',
    height = '1rem',
    borderRadius = '0.25rem',
    className = '',
    hidden = true,
    ...props
}: SkeletonProps) => {
    return (
        <div
            className={`${styles.skeleton} ${className}`}
            style={{
                width: typeof width === 'number' ? `${width}px` : width,
                height: typeof height === 'number' ? `${height}px` : height,
                borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
            }}
            aria-hidden={hidden}
            role="presentation"
            {...props}
        />
    );
});

/**
 * Skeleton text block with multiple lines
 */
export function SkeletonText({
    lines = 3,
    lineHeight = '1rem',
    gap = '0.5rem',
    hidden = true,
    ...props
}: {
    lines?: number;
    lineHeight?: string | number;
    gap?: string | number;
    hidden?: boolean;
}) {
    return (
        <div
            style={{ display: 'flex', flexDirection: 'column', gap }}
            {...props}
        >
            {Array.from({ length: lines }).map((_, index) => (
                <Skeleton
                    key={index}
                    height={lineHeight}
                    width={index === lines - 1 ? '60%' : '100%'}
                    hidden={hidden}
                />
            ))}
        </div>
    );
}

/**
 * Skeleton card for loading states
 */
export function SkeletonCard({
    hidden = true,
    ...props
}: {
    hidden?: boolean;
}) {
    return (
        <div
            className={styles.card}
            role="status"
            aria-label="Loading content"
            {...props}
        >
            <Skeleton height="1.25rem" width="60%" hidden={hidden} />
            <SkeletonText lines={2} hidden={hidden} />
        </div>
    );
}
