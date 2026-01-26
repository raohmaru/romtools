import type { ComponentPropsWithoutRef } from 'react';
import { useState, useCallback, useRef, memo } from 'react';
import styles from './Textarea.module.css';
import { isValidFileContent } from '@/utils/security';
import { MAX_FILE_SIZE } from '@/utils/constants';

export interface TextareaProps extends ComponentPropsWithoutRef<'textarea'> {
    /**
     * Label for the textarea
     */
    label?: string;
    hideLabel?: boolean;
    /**
     * Error message to display
     */
    error?: string;
    /**
     * Additional CSS class name for the wrapper
     */
    className?: string;
    /**
     * The name attribute (required for form registration)
     */
    name: string;
    /**
     * Whether the field is required
     */
    required?: boolean;
    /**
     * Element should be focused on page load
     */
    autoFocus?: boolean;
    /**
     * Callback function to handle form submission
     */
    onSubmit?: () => void;
    /**
     * Ref to the textarea element
     */
    ref?: React.Ref<HTMLTextAreaElement>;
}

export const Textarea = memo(({
    label,
    hideLabel = false,
    name,
    error,
    className = '',
    required,
    autoFocus = false,
    id,
    onSubmit,
    ref,
    ...props
}: TextareaProps) => {
    const textareaId = id || `textarea-${name}`;
    const errorId = error ? `${textareaId}-error` : undefined;
    const [isDragging, setIsDragging] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [gameCount, setGameCount] = useState(0);
    const [customError, setCustomError] = useState('');

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            onSubmit?.();
        }
        setCustomError('');
    };

    const countLines = () => {
        const text = textareaRef.current?.value;
        if (text) {
            // Count non-empty lines
            const lines = text.split('\n').filter(line => line.trim().length > 0);
            setGameCount(lines.length);
        } else {
            setGameCount(0);
        }
    };

    const handleDragEnter = useCallback(() => {
        setIsDragging(true);
        setCustomError('');
    }, []);

    const handleDragLeave = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        const files = [...e.dataTransfer.items].filter(
            (item) => item.kind === 'file' && (item.type === 'text/plain' || item.type === '')
        );
        if (files.length) {
            e.dataTransfer.dropEffect = 'copy';
        }
    }, []);

    const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files?.length > 0) {
            const file = files[0];
            // Check file size
            if (file.size > MAX_FILE_SIZE) {
                setCustomError(`File size exceeds ${MAX_FILE_SIZE} KB limit`);
                return;
            }
            try {
                const text = await file.text();
                // Validate file content contains only printable ASCII characters
                if (!isValidFileContent(text)) {
                    setCustomError('File contains invalid characters. Only printable ASCII characters are allowed.');
                    return;
                }
                // Update the textarea value using the ref
                if (textareaRef.current) {
                    textareaRef.current.value = text;
                    // Trigger input event to notify any listeners
                    textareaRef.current.dispatchEvent(new Event('input', { bubbles: true }));
                    countLines();
                }
            } catch (error) {
                console.error('Error reading file:', error);
            }
        }
    }, []);

    return (
        <div className={`${styles.wrapper} ${className}`}>
            {label && (
                <label
                    htmlFor={textareaId}
                    className={`${styles.label} ${hideLabel ? 'sr-only' : ''}`}
                >
                    {label}
                    {required && <span className={styles.required} aria-hidden="true">*</span>}
                    {gameCount > 0 && (
                        <>
                            &nbsp; ({gameCount})
                        </>
                    )}
                </label>
            )}
            <div
                className={`flex ${isDragging ? styles.dragging : ''}`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <textarea
                    ref={(el) => {
                        // Combine the internal ref with the external ref
                        textareaRef.current = el;
                        if (typeof ref === 'function') {
                            ref(el);
                        } else if (ref) {
                            ref.current = el;
                        }
                    }}
                    id={textareaId}
                    name={name}
                    className={styles.textarea}
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={errorId}
                    aria-required={required}
                    onKeyDown={handleKeyDown}
                    onKeyUp={countLines}
                    autoFocus={autoFocus}
                    {...props}
                />
                {isDragging && (
                    <div className={styles['drop-overlay']}>
                        <span className={styles['drop-text']}>Drop file here</span>
                    </div>
                )}
                 {hideLabel && gameCount > 0 && (
                    <span className={styles['game-count']} title={`${gameCount} games`}>{gameCount}</span>
                 )}
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
            {customError && (
                <span
                    className={styles.error}
                    role="alert"
                >
                    {customError}
                </span>
            )}
        </div>
    );
});
