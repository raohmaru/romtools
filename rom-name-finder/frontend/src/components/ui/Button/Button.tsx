import type { ComponentPropsWithoutRef } from 'react';
import styles from './Button.module.css';

export interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
    /**
     * Button style variant
     * @default 'primary'
     */
    variant?: 'primary' | 'secondary';
    /**
     * Button size
     * @default 'primary'
     */
    size?: 'small' | 'medium' | 'large';
    /**
     * Button type
     * @default 'button'
     */
    type?: 'button' | 'submit' | 'reset';
    /**
     * Whether the button is disabled
     */
    disabled?: boolean;
    /**
     * Click handler
     */
    onClick?: () => void;
    /**
     * Button content
     */
    children: React.ReactNode;
    /**
     * Additional CSS class name
     */
    className?: string;
    /**
     * Accessible label for icon-only buttons
     */
    'aria-label'?: string;
    /**
     * Ref to the textarea element
     */
    ref?: React.Ref<HTMLButtonElement>;
}

export const Button = ({
    variant = 'primary',
    size = 'medium',
    type = 'button',
    disabled = false,
    className = '',
    children,
    ref,
    onClick,
    ...props
}: ButtonProps) => {
    const combinedClassName = `${styles.button} ${styles[variant]} ${styles[size]} ${className}`.trim();

    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
        if (disabled) {
            return;
        }
        if (event.code === 'Enter' || event.code === 'Space') {
            onClick?.();
        }
    };

    return (
        <button
            ref={ref}
            type={type}
            disabled={disabled}
            className={combinedClassName}
            onClick={onClick}
            onKeyDown={handleKeyDown}
            {...props}
        >
            {children}
        </button>
    );
}
