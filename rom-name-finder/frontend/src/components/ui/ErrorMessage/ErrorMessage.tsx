import type { ComponentPropsWithoutRef } from 'react';
import styles from './ErrorMessage.module.css';

export interface ErrorMessageProps extends ComponentPropsWithoutRef<'div'> {
    /**
     * The error message to display
     */
    message: string;
    /**
     * ARIA role for accessibility
     * @default 'alert'
     */
    role?: 'alert' | 'status' | 'log';
    /**
     * Additional CSS class name
     */
    className?: string;
}

export function ErrorMessage({
    message,
    role = 'alert',
    className = '',
    ...props
}: ErrorMessageProps) {
    if (!message) {
        return null;
    }

    const combinedClassName = `${styles.error} ${className}`.trim();

    return (
        <div
            className={combinedClassName}
            role={role}
            {...props}
        >
            {message}
            
        </div>
    );
}
