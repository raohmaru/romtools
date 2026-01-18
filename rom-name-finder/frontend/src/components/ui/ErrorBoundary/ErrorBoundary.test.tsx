import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
    if (shouldThrow) {
        throw new Error('Test error');
    }
    return <div>No error</div>;
};

describe('ErrorBoundary', () => {
    describe('Rendering', () => {
        it('should render children when no error occurs', () => {
            render(
                <ErrorBoundary>
                    <div>Child content</div>
                </ErrorBoundary>
            );
            expect(screen.getByText('Child content')).toBeInTheDocument();
        });

        it('should render fallback UI when error occurs', () => {
            render(
                <ErrorBoundary>
                    <ThrowError shouldThrow />
                </ErrorBoundary>
            );
            expect(screen.getByText('Something went wrong')).toBeInTheDocument();
        });

        it('should render custom fallback when provided', () => {
            const customFallback = <div>Custom error message</div>;
            render(
                <ErrorBoundary fallback={customFallback}>
                    <ThrowError shouldThrow />
                </ErrorBoundary>
            );
            expect(screen.getByText('Custom error message')).toBeInTheDocument();
            expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
        });

        it('should display error message', () => {
            render(
                <ErrorBoundary>
                    <ThrowError shouldThrow />
                </ErrorBoundary>
            );
            expect(screen.getByText('Test error')).toBeInTheDocument();
        });
    });

    describe('Error Catching', () => {
        it('should catch errors in child components', () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
            render(
                <ErrorBoundary>
                    <ThrowError shouldThrow />
                </ErrorBoundary>
            );
            expect(screen.getByText('Something went wrong')).toBeInTheDocument();
            consoleSpy.mockRestore();
        });

        it('should catch errors in nested components', () => {
            const NestedError = () => {
                throw new Error('Nested error');
            };
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
            render(
                <ErrorBoundary>
                    <div>
                        <NestedError />
                    </div>
                </ErrorBoundary>
            );
            expect(screen.getByText('Something went wrong')).toBeInTheDocument();
            consoleSpy.mockRestore();
        });

        it('should log error to console', () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
            render(
                <ErrorBoundary>
                    <ThrowError shouldThrow />
                </ErrorBoundary>
            );
            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });
    });

    describe('Retry Functionality', () => {
        it('should call onRetry when retry button is clicked', () => {
            const handleRetry = vi.fn();
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
            render(
                <ErrorBoundary onRetry={handleRetry}>
                    <ThrowError shouldThrow />
                </ErrorBoundary>
            );
            const retryButton = screen.getByText('Try Again');
            act(() => {
                retryButton.click();
            });
            expect(handleRetry).toHaveBeenCalledTimes(1);
            consoleSpy.mockRestore();
        });

        it('should reset error state after retry', () => {
            const handleRetry = vi.fn();
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
            const { rerender } = render(
                <ErrorBoundary onRetry={handleRetry}>
                    <ThrowError shouldThrow={false} />
                </ErrorBoundary>
            );
            expect(screen.getByText('No error')).toBeInTheDocument();

            rerender(
                <ErrorBoundary onRetry={handleRetry}>
                    <ThrowError shouldThrow />
                </ErrorBoundary>
            );
            expect(screen.getByText('Something went wrong')).toBeInTheDocument();

            const retryButton = screen.getByText('Try Again');
            act(() => {
                retryButton.click();
            });
            expect(handleRetry).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });
    });

    describe('Accessibility', () => {
        it('should have role="alert" on error container', () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
            render(
                <ErrorBoundary>
                    <ThrowError shouldThrow />
                </ErrorBoundary>
            );
            const errorContainer = screen.getByRole('alert');
            expect(errorContainer).toBeInTheDocument();
            consoleSpy.mockRestore();
        });

        it('should have aria-live="assertive" on error container', () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
            render(
                <ErrorBoundary>
                    <ThrowError shouldThrow />
                </ErrorBoundary>
            );
            const errorContainer = screen.getByRole('alert');
            expect(errorContainer).toHaveAttribute('aria-live', 'assertive');
            consoleSpy.mockRestore();
        });

        it('should have accessible error message', () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
            render(
                <ErrorBoundary>
                    <ThrowError shouldThrow />
                </ErrorBoundary>
            );
            const errorMessage = screen.getByText('Something went wrong');
            expect(errorMessage).toBeInTheDocument();
            consoleSpy.mockRestore();
        });
    });

    describe('Error Details', () => {
        it('should display error details in details element', () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
            render(
                <ErrorBoundary>
                    <ThrowError shouldThrow />
                </ErrorBoundary>
            );
            const detailsSummary = screen.getByText('Error details');
            expect(detailsSummary).toBeInTheDocument();
            consoleSpy.mockRestore();
        });

        it('should display stack trace', () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
            render(
                <ErrorBoundary>
                    <ThrowError shouldThrow />
                </ErrorBoundary>
            );
            const stackTrace = document.querySelector('.stack-trace');
            expect(stackTrace).toBeInTheDocument();
            consoleSpy.mockRestore();
        });

        it('should show "No stack trace available" when stack is undefined', () => {
            const ThrowNoStack = () => {
                const error = new Error('No stack');
                error.stack = undefined as any;
                throw error;
            };
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
            render(
                <ErrorBoundary>
                    <ThrowNoStack />
                </ErrorBoundary>
            );
            expect(screen.getByText('No stack trace available')).toBeInTheDocument();
            consoleSpy.mockRestore();
        });
    });

    describe('Edge Cases', () => {
        it('should handle multiple children', () => {
            render(
                <ErrorBoundary>
                    <div>Child 1</div>
                    <div>Child 2</div>
                    <div>Child 3</div>
                </ErrorBoundary>
            );
            expect(screen.getByText('Child 1')).toBeInTheDocument();
            expect(screen.getByText('Child 2')).toBeInTheDocument();
            expect(screen.getByText('Child 3')).toBeInTheDocument();
        });

        it('should handle null children', () => {
            render(
                <ErrorBoundary>
                    {null}
                </ErrorBoundary>
            );
            const errorContainer = screen.queryByRole('alert');
            expect(errorContainer).not.toBeInTheDocument();
        });

        it('should handle undefined children', () => {
            render(
                <ErrorBoundary>
                    {undefined}
                </ErrorBoundary>
            );
            const errorContainer = screen.queryByRole('alert');
            expect(errorContainer).not.toBeInTheDocument();
        });
    });
});
