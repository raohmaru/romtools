import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Headline } from './Headline';

describe('Headline', () => {
    describe('Rendering', () => {
        it('should render with text content', () => {
            render(<Headline>Test Headline</Headline>);
            const headline = screen.getByText('Test Headline');
            expect(headline).toBeInTheDocument();
        });

        it('should render with custom className', () => {
            render(
                <Headline className="custom-class">Test Headline</Headline>
            );
            const headline = screen.getByText('Test Headline');
            expect(headline).toHaveClass('custom-class');
        });

        it('should render with custom id', () => {
            render(<Headline id="custom-id">Test Headline</Headline>);
            const headline = screen.getByText('Test Headline');
            expect(headline).toHaveAttribute('id', 'custom-id');
        });

        it('should render with level 1 by default', () => {
            render(<Headline>Test Headline</Headline>);
            const headline = screen.getByRole('heading', { level: 1 });
            expect(headline).toBeInTheDocument();
        });

        it('should render with level 2', () => {
            render(<Headline level={2}>Test Headline</Headline>);
            const headline = screen.getByRole('heading', { level: 2 });
            expect(headline).toBeInTheDocument();
        });

        it('should render with level 3', () => {
            render(<Headline level={3}>Test Headline</Headline>);
            const headline = screen.getByRole('heading', { level: 3 });
            expect(headline).toBeInTheDocument();
        });

        it('should render with level 4', () => {
            render(<Headline level={4}>Test Headline</Headline>);
            const headline = screen.getByRole('heading', { level: 4 });
            expect(headline).toBeInTheDocument();
        });

        it('should render with level 5', () => {
            render(<Headline level={5}>Test Headline</Headline>);
            const headline = screen.getByRole('heading', { level: 5 });
            expect(headline).toBeInTheDocument();
        });

        it('should render with level 6', () => {
            render(<Headline level={6}>Test Headline</Headline>);
            const headline = screen.getByRole('heading', { level: 6 });
            expect(headline).toBeInTheDocument();
        });

        it('should render with children as React node', () => {
            render(
                <Headline>
                    <span>Test Headline</span>
                </Headline>
            );
            const headline = screen.getByRole('heading');
            expect(headline).toBeInTheDocument();
            expect(headline).toContainHTML('<span>Test Headline</span>');
        });

        it('should render with multiple children', () => {
            render(
                <Headline>
                    <span>Part 1</span> <span>Part 2</span>
                </Headline>
            );
            const headline = screen.getByRole('heading');
            expect(headline).toBeInTheDocument();
            expect(headline).toHaveTextContent('Part 1 Part 2');
        });
    });

    describe('Accessibility', () => {
        it('should have correct heading level for level 1', () => {
            render(<Headline level={1}>Test Headline</Headline>);
            const headline = screen.getByRole('heading', { level: 1 });
            expect(headline.tagName).toBe('H1');
        });

        it('should have correct heading level for level 2', () => {
            render(<Headline level={2}>Test Headline</Headline>);
            const headline = screen.getByRole('heading', { level: 2 });
            expect(headline.tagName).toBe('H2');
        });

        it('should have correct heading level for level 3', () => {
            render(<Headline level={3}>Test Headline</Headline>);
            const headline = screen.getByRole('heading', { level: 3 });
            expect(headline.tagName).toBe('H3');
        });

        it('should have correct heading level for level 4', () => {
            render(<Headline level={4}>Test Headline</Headline>);
            const headline = screen.getByRole('heading', { level: 4 });
            expect(headline.tagName).toBe('H4');
        });

        it('should have correct heading level for level 5', () => {
            render(<Headline level={5}>Test Headline</Headline>);
            const headline = screen.getByRole('heading', { level: 5 });
            expect(headline.tagName).toBe('H5');
        });

        it('should have correct heading level for level 6', () => {
            render(<Headline level={6}>Test Headline</Headline>);
            const headline = screen.getByRole('heading', { level: 6 });
            expect(headline.tagName).toBe('H6');
        });

        it('should be accessible by role', () => {
            render(<Headline>Test Headline</Headline>);
            const headline = screen.getByRole('heading');
            expect(headline).toBeInTheDocument();
        });

        it('should be accessible by text', () => {
            render(<Headline>Test Headline</Headline>);
            const headline = screen.getByText('Test Headline');
            expect(headline).toBeInTheDocument();
        });
    });

    describe('Additional Props', () => {
        it('should pass through additional props', () => {
            render(
                <Headline data-testid="test-headline">Test Headline</Headline>
            );
            const headline = screen.getByTestId('test-headline');
            expect(headline).toBeInTheDocument();
        });

        it('should pass through aria-label', () => {
            render(
                <Headline aria-label="Accessible Headline">Test Headline</Headline>
            );
            const headline = screen.getByLabelText('Accessible Headline');
            expect(headline).toBeInTheDocument();
        });

        it('should pass through title attribute', () => {
            render(
                <Headline title="Tooltip text">Test Headline</Headline>
            );
            const headline = screen.getByTitle('Tooltip text');
            expect(headline).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('should render with empty content', () => {
            render(<Headline>{''}</Headline>);
            const headline = screen.getByRole('heading');
            expect(headline).toBeInTheDocument();
            expect(headline).toBeEmptyDOMElement();
        });

        it('should render with whitespace content', () => {
            render(<Headline>{'   '}</Headline>);
            const headline = screen.getByRole('heading');
            expect(headline).toBeInTheDocument();
        });

        it('should render with special characters', () => {
            render(<Headline>Test & Headline</Headline>);
            const headline = screen.getByText('Test & Headline');
            expect(headline).toBeInTheDocument();
        });

        it('should render with very long text', () => {
            const longText = 'A'.repeat(1000);
            render(<Headline>{longText}</Headline>);
            const headline = screen.getByText(longText);
            expect(headline).toBeInTheDocument();
        });

        it('should render with HTML entities', () => {
            render(<Headline>Test & Headline</Headline>);
            const headline = screen.getByText('Test & Headline');
            expect(headline).toBeInTheDocument();
        });
    });

    describe('Styling', () => {
        it('should apply base class', () => {
            render(<Headline>Test Headline</Headline>);
            const headline = screen.getByRole('heading');
            expect(headline).toHaveClass('headline');
        });

        it('should apply level-specific class', () => {
            render(<Headline level={2}>Test Headline</Headline>);
            const headline = screen.getByRole('heading', { level: 2 });
            expect(headline).toHaveClass('level-2');
        });

        it('should merge custom classes with base classes', () => {
            render(
                <Headline className="custom-class">Test Headline</Headline>
            );
            const headline = screen.getByRole('heading');
            expect(headline).toHaveClass('headline');
            expect(headline).toHaveClass('custom-class');
        });
    });
});
