import type { ComponentPropsWithoutRef } from 'react';
import { memo } from 'react';
import styles from './Select.module.css';

export interface SelectOption {
    /** The value to be submitted */
    value: string;
    /** The display label */
    label?: string;
}

export interface SelectProps extends ComponentPropsWithoutRef<'select'> {
    /**
     * Label for the select
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
     * Array of options to display
     */
    options: SelectOption[];
    /**
     * Error message to display
     */
    error?: string;
    /**
     * Whether the field is required
     */
    required?: boolean;
    /**
     * Additional CSS class name for the wrapper
     */
    className?: string;
    /**
     * Default placeholder option (optional)
     */
    placeholder?: string;
    /**
     * Ref to the textarea element
     */
    ref?: React.Ref<HTMLSelectElement>;
}

export const Select = memo(({
    label,
    labelTitle,
    name,
    options,
    error,
    required,
    className = '',
    placeholder,
    id,
    ref,
    ...props
}: SelectProps) => {
    const selectId = id || `select-${name}`;
    const errorId = error ? `${selectId}-error` : undefined;

    return (
        <div className={`${styles.wrapper} ${className}`}>
            <label
                htmlFor={selectId}
                className={styles.label}
                title={labelTitle}
            >
                {label}
                {required && (
                    <span className={styles.required} aria-hidden="true">*</span>
                )}
            </label>
            <div className={styles['select-wrapper']}>
                <select
                    ref={ref}
                    id={selectId}
                    name={name}
                    className={styles.select}
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={errorId}
                    aria-required={required}
                    {...props}
                >
                    {placeholder && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label || option.value}
                        </option>
                    ))}
                </select>
            </div>
            {error && (
                <span
                    id={errorId}
                    className={styles.error}
                    role="alert"
                >
                    {error}
                </span>
            )}
        </div>
    );
});
