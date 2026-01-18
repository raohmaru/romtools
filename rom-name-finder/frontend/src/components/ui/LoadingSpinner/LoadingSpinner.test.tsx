import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from './LoadingSpinner';

describe('LoadingSpinner', () => {
    describe('Rendering', () => {
        it('should render with medium size by default', () => {
            render(<LoadingSpinner />);
            const spinner = screen.getByRole('status');
            expect(spinner).toBeInTheDocument();
            expect(spinner).toHaveClass('spinner');
            expect(spinner).toHaveClass('medium');
        });

        it('should render with small size', () => {
            render(<LoadingSpinner size="small" />);
            const spinner = screen.getByRole('status');
            expect(spinner).toBeInTheDocument();
            expect(spinner).toHaveClass('small');
        });

        it('should render with large size', () => {
            render(<LoadingSpinner size="large" />);
            const spinner = screen.getByRole('status');
            expect(spinner).toBeInTheDocument();
            expect(spinner).toHaveClass('large');
        });

        it('should render with custom className', () => {
            render(<LoadingSpinner className="custom-class" />);
            const spinner = screen.getByRole('status');
            expect(spinner).toHaveClass('custom-class');
        });

        it('should render with default label', () => {
            render(<LoadingSpinner />);
            const spinner = screen.getByRole('status');
            const label = spinner.querySelector('.sr-only');
            expect(label).toHaveTextContent('Loading');
        });

        it('should render with custom label', () => {
            render(<LoadingSpinner label="Please wait..." />);
            const spinner = screen.getByRole('status');
            const label = spinner.querySelector('.sr-only');
            expect(label).toHaveTextContent('Please wait...');
        });
    });

    describe('Accessibility', () => {
        it('should have role="status"', () => {
            render(<LoadingSpinner />);
            const spinner = screen.getByRole('status');
            expect(spinner).toBeInTheDocument();
        });

        it('should have aria-live="polite"', () => {
            render(<LoadingSpinner />);
            const spinner = screen.getByRole('status');
            expect(spinner).toHaveAttribute('aria-live', 'polite');
        });

        it('should have screen reader only text', () => {
            render(<LoadingSpinner label="Loading content" />);
            const spinner = screen.getByRole('status');
            const label = spinner.querySelector('.sr-only');
            expect(label).toBeInTheDocument();
            expect(label).toHaveTextContent('Loading content');
        });

        it('should be accessible to screen readers', () => {
            render(<LoadingSpinner label="Processing data" />);
            const spinner = screen.getByRole('status', { name: 'Processing data' });
            expect(spinner).toBeInTheDocument();
        });
    });

    describe('Additional Props', () => {
        it('should pass through additional props to div', () => {
            render(<LoadingSpinner data-testid="test-spinner" />);
            const spinner = screen.getByTestId('test-spinner');
            expect(spinner).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('should render with empty label', () => {
            render(<LoadingSpinner label="" />);
            const spinner = screen.getByRole('status');
            const label = spinner.querySelector('.sr-only');
            expect(label).toHaveTextContent('');
        });

        it('should render with very long label', () => {
            const longLabel = 'This is a very long loading message that provides detailed information about what is happening';
            render(<LoadingSpinner label={longLabel} />);
            const spinner = screen.getByRole('status');
            const label = spinner.querySelector('.sr-only');
            expect(label).toHaveTextContent(longLabel);
        });

        it('should render with special characters in label', () => {
            render(<LoadingSpinner label="Loading & processing" />);
            const spinner = screen.getByRole('status');
            const label = spinner.querySelector('.sr-only');
            expect(label).toHaveTextContent('Loading & processing');
        });
    });
});
