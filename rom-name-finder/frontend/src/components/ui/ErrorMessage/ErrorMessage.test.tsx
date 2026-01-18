import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorMessage } from './ErrorMessage';

describe('ErrorMessage', () => {
    describe('Rendering', () => {
        it('should render with message', () => {
            render(<ErrorMessage message="An error occurred" />);
            const errorMessage = screen.getByText('An error occurred');
            expect(errorMessage).toBeInTheDocument();
        });

        it('should render with custom className', () => {
            render(
                <ErrorMessage
                    message="An error occurred"
                    className="custom-class"
                />
            );
            const errorMessage = screen.getByText('An error occurred');
            expect(errorMessage).toHaveClass('custom-class');
        });

        it('should render with role="alert" by default', () => {
            render(<ErrorMessage message="An error occurred" />);
            const errorMessage = screen.getByRole('alert');
            expect(errorMessage).toBeInTheDocument();
        });

        it('should render with role="status"', () => {
            render(
                <ErrorMessage
                    message="An error occurred"
                    role="status"
                />
            );
            const errorMessage = screen.getByRole('status');
            expect(errorMessage).toBeInTheDocument();
        });

        it('should render with role="log"', () => {
            render(
                <ErrorMessage
                    message="An error occurred"
                    role="log"
                />
            );
            const errorMessage = screen.getByRole('log');
            expect(errorMessage).toBeInTheDocument();
        });
    });

    describe('Empty Message', () => {
        it('should not render when message is empty', () => {
            render(<ErrorMessage message="" />);
            const errorMessage = screen.queryByRole('alert');
            expect(errorMessage).not.toBeInTheDocument();
        });

        it('should not render when message is undefined', () => {
            render(<ErrorMessage message={undefined as any} />);
            const errorMessage = screen.queryByRole('alert');
            expect(errorMessage).not.toBeInTheDocument();
        });

        it('should not render when message is null', () => {
            render(<ErrorMessage message={null as any} />);
            const errorMessage = screen.queryByRole('alert');
            expect(errorMessage).not.toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('should have role="alert" by default', () => {
            render(<ErrorMessage message="An error occurred" />);
            const errorMessage = screen.getByRole('alert');
            expect(errorMessage).toBeInTheDocument();
        });

        it('should have custom role when provided', () => {
            render(
                <ErrorMessage
                    message="An error occurred"
                    role="status"
                />
            );
            const errorMessage = screen.getByRole('status');
            expect(errorMessage).toBeInTheDocument();
        });

        it('should be accessible to screen readers', () => {
            render(<ErrorMessage message="An error occurred" />);
            const errorMessage = screen.getByRole('alert');
            expect(errorMessage).toHaveTextContent('An error occurred');
        });
    });

    describe('Additional Props', () => {
        it('should pass through additional props to div', () => {
            render(
                <ErrorMessage
                    message="An error occurred"
                    data-testid="test-error"
                />
            );
            const errorMessage = screen.getByTestId('test-error');
            expect(errorMessage).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('should render with very long message', () => {
            const longMessage = 'This is a very long error message that provides detailed information about what went wrong and might wrap to multiple lines';
            render(<ErrorMessage message={longMessage} />);
            const errorMessage = screen.getByText(longMessage);
            expect(errorMessage).toBeInTheDocument();
        });

        it('should render with special characters', () => {
            render(<ErrorMessage message="Error & <special>" />);
            const errorMessage = screen.getByRole('alert');
            expect(errorMessage).toHaveTextContent('Error & <special>');
        });

        it('should render with numbers', () => {
            render(<ErrorMessage message="Error code: 404" />);
            const errorMessage = screen.getByText('Error code: 404');
            expect(errorMessage).toBeInTheDocument();
        });

        it('should render with HTML entities', () => {
            render(<ErrorMessage message="Error: Invalid input" />);
            const errorMessage = screen.getByRole('alert');
            expect(errorMessage).toHaveTextContent('Error: Invalid input');
        });
    });
});
