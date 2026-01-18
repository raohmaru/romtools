import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
    describe('Rendering', () => {
        it('should render with primary variant by default', () => {
            render(<Button>Click me</Button>);
            const button = screen.getByRole('button', { name: 'Click me' });
            expect(button).toBeInTheDocument();
            expect(button).toHaveClass('button');
            expect(button).toHaveClass('primary');
        });

        it('should render with secondary variant', () => {
            render(<Button variant="secondary">Click me</Button>);
            const button = screen.getByRole('button', { name: 'Click me' });
            expect(button).toBeInTheDocument();
            expect(button).toHaveClass('secondary');
        });

        it('should render with small size', () => {
            render(<Button size="small">Click me</Button>);
            const button = screen.getByRole('button', { name: 'Click me' });
            expect(button).toHaveClass('small');
        });

        it('should render with medium size by default', () => {
            render(<Button>Click me</Button>);
            const button = screen.getByRole('button', { name: 'Click me' });
            expect(button).toHaveClass('medium');
        });

        it('should render with large size', () => {
            render(<Button size="large">Click me</Button>);
            const button = screen.getByRole('button', { name: 'Click me' });
            expect(button).toHaveClass('large');
        });

        it('should render with custom className', () => {
            render(<Button className="custom-class">Click me</Button>);
            const button = screen.getByRole('button', { name: 'Click me' });
            expect(button).toHaveClass('custom-class');
        });

        it('should render children content', () => {
            render(<Button>Submit Form</Button>);
            const button = screen.getByRole('button', { name: 'Submit Form' });
            expect(button).toHaveTextContent('Submit Form');
        });

        it('should render with type="button" by default', () => {
            render(<Button>Click me</Button>);
            const button = screen.getByRole('button', { name: 'Click me' });
            expect(button).toHaveAttribute('type', 'button');
        });

        it('should render with type="submit"', () => {
            render(<Button type="submit">Submit</Button>);
            const button = screen.getByRole('button', { name: 'Submit' });
            expect(button).toHaveAttribute('type', 'submit');
        });

        it('should render with type="reset"', () => {
            render(<Button type="reset">Reset</Button>);
            const button = screen.getByRole('button', { name: 'Reset' });
            expect(button).toHaveAttribute('type', 'reset');
        });
    });

    describe('Click Events', () => {
        it('should call onClick handler when clicked', () => {
            const handleClick = vi.fn();
            render(<Button onClick={handleClick}>Click me</Button>);
            const button = screen.getByRole('button', { name: 'Click me' });
            fireEvent.click(button);
            expect(handleClick).toHaveBeenCalledTimes(1);
        });

        it('should not call onClick handler when disabled', () => {
            const handleClick = vi.fn();
            render(<Button onClick={handleClick} disabled>Click me</Button>);
            const button = screen.getByRole('button', { name: 'Click me' });
            fireEvent.click(button);
            expect(handleClick).not.toHaveBeenCalled();
        });
    });

    describe('Disabled State', () => {
        it('should render with disabled attribute when disabled is true', () => {
            render(<Button disabled>Click me</Button>);
            const button = screen.getByRole('button', { name: 'Click me' });
            expect(button).toBeDisabled();
        });

        it('should not render with disabled attribute when disabled is false', () => {
            render(<Button disabled={false}>Click me</Button>);
            const button = screen.getByRole('button', { name: 'Click me' });
            expect(button).not.toBeDisabled();
        });
    });

    describe('Accessibility', () => {
        it('should have proper role attribute', () => {
            render(<Button>Click me</Button>);
            const button = screen.getByRole('button');
            expect(button).toBeInTheDocument();
        });

        it('should have aria-label when provided', () => {
            render(<Button aria-label="Search button">🔍</Button>);
            const button = screen.getByRole('button', { name: 'Search button' });
            expect(button).toHaveAttribute('aria-label', 'Search button');
        });

        it('should be keyboard navigable', () => {
            render(<Button>Click me</Button>);
            const button = screen.getByRole('button', { name: 'Click me' });
            expect(button.tagName).toBe('BUTTON');
        });

        it('should trigger click on Enter key press', () => {
            const handleClick = vi.fn();
            render(<Button onClick={handleClick}>Click me</Button>);
            const button = screen.getByRole('button', { name: 'Click me' });
            button.focus();
            fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
            expect(handleClick).toHaveBeenCalledTimes(1);
        });

        it('should trigger click on Space key press', () => {
            const handleClick = vi.fn();
            render(<Button onClick={handleClick}>Click me</Button>);
            const button = screen.getByRole('button', { name: 'Click me' });
            button.focus();
            fireEvent.keyDown(button, { key: ' ', code: 'Space' });
            expect(handleClick).toHaveBeenCalledTimes(1);
        });

        it('should not trigger click on Enter key when disabled', () => {
            const handleClick = vi.fn();
            render(<Button onClick={handleClick} disabled>Click me</Button>);
            const button = screen.getByRole('button', { name: 'Click me' });
            fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
            expect(handleClick).not.toHaveBeenCalled();
        });
    });

    describe('Additional Props', () => {
        it('should pass through additional props to button element', () => {
            render(<Button data-testid="test-button">Click me</Button>);
            const button = screen.getByTestId('test-button');
            expect(button).toBeInTheDocument();
        });

        it('should pass through id prop', () => {
            render(<Button id="my-button">Click me</Button>);
            const button = screen.getByRole('button', { name: 'Click me' });
            expect(button).toHaveAttribute('id', 'my-button');
        });

        it('should pass through title prop', () => {
            render(<Button title="Button tooltip">Click me</Button>);
            const button = screen.getByRole('button', { name: 'Click me' });
            expect(button).toHaveAttribute('title', 'Button tooltip');
        });
    });
});
