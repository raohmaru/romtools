import type { ComponentPropsWithoutRef } from 'react';
import styles from './LoadingSpinner.module.css';

export interface LoadingSpinnerProps extends ComponentPropsWithoutRef<'div'> {
    /**
     * Size of the spinner
     * @default 'medium'
     */
    size?: 'small' | 'medium' | 'large';
    /**
     * Accessible label for screen readers
     */
    label?: string;
    /**
     * Additional CSS class name
     */
    className?: string;

}

export function LoadingSpinner({
    size = 'medium',
    label = 'Loading',
    className = '',
    ...props
}: LoadingSpinnerProps) {
    const combinedClassName = `${styles.spinner} ${styles[size]} ${className}`.trim();

    return (
        <div
            className={combinedClassName}
            role="status"
            aria-live="polite"
            aria-label={label}
            { ...props }
        >
            <span className="sr-only">{label}</span>
        </div>
    );
}
