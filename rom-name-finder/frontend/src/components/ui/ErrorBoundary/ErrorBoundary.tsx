import { Component, type ReactNode, type ErrorInfo } from 'react';
import { Button } from '../Button/Button';
import styles from './ErrorBoundary.module.css';

export interface ErrorBoundaryProps {
    /**
     * Child components to wrap with error boundary
     */
    children: ReactNode;
    /**
     * Fallback component to display when an error occurs
     */
    fallback?: ReactNode;
    /**
     * Callback when retry is clicked
     */
    onRetry?: () => void;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

/**
 * ErrorBoundary component that catches JavaScript errors anywhere in the child component tree
 * and displays a fallback UI with error details and retry option.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    public state: ErrorBoundaryState = {
        hasError: false,
        error: null
    };

    /**
     * Lifecycle method to update state when an error is thrown
     * @param error - The error that was thrown
     * @returns New state with error information
     */
    public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        // Update state so the next render will show the fallback UI.
        return {
            hasError: true,
            error
        };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error('Error caught by ErrorBoundary:', error, errorInfo);
    }

    private handleRetry = (): void => {
        const { onRetry } = this.props;
        this.setState({ hasError: false, error: null });
        if (onRetry) {
            onRetry();
        } else {
            window.location.reload();
        }
    };

    public render(): ReactNode {
        const { hasError, error } = this.state;
        const { children, fallback } = this.props;

        if (hasError) {
            if (fallback) {
                return fallback;
            }

            return (
                <div className={styles.container} role="alert" aria-live="assertive">
                    <div className={styles.content}>
                        <h2 className={styles.title}>Something went wrong</h2>
                        <p className={styles.message}>
                            {error?.message || 'An unexpected error occurred'}
                        </p>
                        <div className={styles.details}>
                            <details>
                                <summary className={styles.summary}>Error details</summary>
                                <pre className={styles['stack-trace']}>
                                    {error?.stack || 'No stack trace available'}
                                </pre>
                            </details>
                        </div>
                        <Button onClick={this.handleRetry} variant="primary">
                            Try Again
                        </Button>
                    </div>
                </div>
            );
        }

        return children;
    }
}
