import type { ComponentPropsWithoutRef } from 'react';
import styles from './Checkbox.module.css';

export interface CheckboxProps extends ComponentPropsWithoutRef<'input'> {
    /**
     * Label for the checkbox
     */
    label: string;
    /**
     * Text for the label title attribute
     */
    labelTitle?: string;
    /**
     * The name attribute (required for form registration)
     */
    name: string;
    /**
     * Additional CSS class name for the wrapper
     */
    className?: string;
    /**
     * Whether the button is disabled
     */
    disabled?: boolean;
    /**
     * Element should be focused on page load
     */
    autoFocus?: boolean;
    /**
     * Ref to the input element
     */
    ref?: React.Ref<HTMLInputElement>;
}

export const Checkbox = ({
    label,
    labelTitle,
    name,
    className = '',
    checked,
    id,
    disabled = false,
    autoFocus = false,
    ref,
    ...props
}: CheckboxProps) => {
    const checkboxId = id || `checkbox-${name}`;

    return (
        <div className={`${styles.wrapper} ${className}`}>
            <label
                htmlFor={checkboxId}
                className={styles.label}
                title={labelTitle}
            >
                {label}
            </label>
            <input
                ref={ref}
                id={checkboxId}
                name={name}
                type="checkbox"
                className={styles.checkbox}
                checked={checked}
                disabled={disabled}
                autoFocus={autoFocus}
                {...props}
            />
        </div>
    );
};
