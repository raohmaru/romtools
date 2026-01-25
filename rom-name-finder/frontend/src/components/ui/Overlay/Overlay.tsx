import type { ComponentPropsWithoutRef } from 'react';
import { memo } from 'react';
import styles from './Overlay.module.css';

export interface OverlayProps extends ComponentPropsWithoutRef<'div'> {
    /**
     * Whether the overlay is visible
     * @default true
     */
    visible?: boolean;
    /**
     * Additional CSS class name
     */
    className?: string;
    /**
     * Ref to the overlay element
     */
    ref?: React.Ref<HTMLDivElement>;
    /**
     * Overlay content
     */
    children: React.ReactNode;
}

export const Overlay = memo(({
        visible = true,
        className = '',
        children,
        ref,
        ...props
    }: OverlayProps) => {
        if (!visible) {
            return null;
        }

        const combinedClassName = `${styles.overlay} ${className}`.trim();

        return (
            <div
                ref={ref}
                className={combinedClassName}
                role='dialog'
                aria-hidden={!visible}
                { ...props }
            >
                <div className={styles.content}>
                    {children}
                </div>
            </div>
        );
    }
);
