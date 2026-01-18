import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
    describe('Rendering', () => {
        it('should render with label', () => {
            render(<Checkbox label="Include clones" name="includeClones" />);
            const label = screen.getByText('Include clones');
            expect(label).toBeInTheDocument();
        });

        it('should render checkbox input', () => {
            render(<Checkbox label="Include clones" name="includeClones" />);
            const checkbox = screen.getByRole('checkbox');
            expect(checkbox).toBeInTheDocument();
        });

        it('should render with custom className', () => {
            render(
                <Checkbox
                    label="Include clones"
                    name="includeClones"
                    className="custom-class"
                />
            );
            const wrapper = screen.getByText('Include clones').closest('div');
            expect(wrapper).toHaveClass('custom-class');
        });

        it('should render with custom id', () => {
            render(
                <Checkbox
                    label="Include clones"
                    name="includeClones"
                    id="custom-id"
                />
            );
            const checkbox = screen.getByRole('checkbox');
            expect(checkbox).toHaveAttribute('id', 'custom-id');
        });

        it('should render unchecked by default', () => {
            render(<Checkbox label="Include clones" name="includeClones" />);
            const checkbox = screen.getByRole('checkbox');
            expect(checkbox).not.toBeChecked();
        });

        it('should render checked when checked prop is true', () => {
            render(
                <Checkbox
                    label="Include clones"
                    name="includeClones"
                    checked
                />
            );
            const checkbox = screen.getByRole('checkbox');
            expect(checkbox).toBeChecked();
        });

        it('should render unchecked when checked prop is false', () => {
            render(
                <Checkbox
                    label="Include clones"
                    name="includeClones"
                    checked={false}
                />
            );
            const checkbox = screen.getByRole('checkbox');
            expect(checkbox).not.toBeChecked();
        });
    });

    describe('Check/Uncheck', () => {
        it('should toggle checked state on click', () => {
            render(<Checkbox label="Include clones" name="includeClones" />);
            const checkbox = screen.getByRole('checkbox');
            expect(checkbox).not.toBeChecked();
            fireEvent.click(checkbox);
            expect(checkbox).toBeChecked();
            fireEvent.click(checkbox);
            expect(checkbox).not.toBeChecked();
        });

        it('should call onChange handler when clicked', () => {
            const handleChange = vi.fn();
            render(
                <Checkbox
                    label="Include clones"
                    name="includeClones"
                    onChange={handleChange}
                />
            );
            const checkbox = screen.getByRole('checkbox');
            fireEvent.click(checkbox);
            expect(handleChange).toHaveBeenCalledTimes(1);
        });

        it('should toggle checked state when label is clicked', () => {
            render(<Checkbox label="Include clones" name="includeClones" />);
            const label = screen.getByText('Include clones');
            const checkbox = screen.getByRole('checkbox');
            expect(checkbox).not.toBeChecked();
            fireEvent.click(label);
            expect(checkbox).toBeChecked();
        });

        it('should update checked state when prop changes', () => {
            const { rerender } = render(
                <Checkbox
                    label="Include clones"
                    name="includeClones"
                    checked={false}
                />
            );
            const checkbox = screen.getByRole('checkbox');
            expect(checkbox).not.toBeChecked();
            rerender(
                <Checkbox
                    label="Include clones"
                    name="includeClones"
                    checked
                />
            );
            expect(checkbox).toBeChecked();
        });
    });

    describe('Disabled State', () => {
        it('should render with disabled attribute when disabled', () => {
            render(
                <Checkbox
                    label="Include clones"
                    name="includeClones"
                    disabled
                />
            );
            const checkbox = screen.getByRole('checkbox');
            expect(checkbox).toBeDisabled();
        });
    });

    describe('Accessibility', () => {
        it('should have proper label association', () => {
            render(<Checkbox label="Include clones" name="includeClones" />);
            const checkbox = screen.getByLabelText('Include clones');
            expect(checkbox).toBeInTheDocument();
        });

        it('should have role="checkbox"', () => {
            render(<Checkbox label="Include clones" name="includeClones" />);
            const checkbox = screen.getByRole('checkbox');
            expect(checkbox).toBeInTheDocument();
        });

        it('should have type="checkbox"', () => {
            render(<Checkbox label="Include clones" name="includeClones" />);
            const checkbox = screen.getByRole('checkbox');
            expect(checkbox).toHaveAttribute('type', 'checkbox');
        });

        it('should be keyboard accessible', () => {
            render(<Checkbox label="Include clones" name="includeClones" />);
            const checkbox = screen.getByRole('checkbox');
            expect(checkbox.tagName).toBe('INPUT');
        });

        it('should not toggle on Space key when disabled', () => {
            render(
                <Checkbox
                    label="Include clones"
                    name="includeClones"
                    disabled
                />
            );
            const checkbox = screen.getByRole('checkbox');
            expect(checkbox).not.toBeChecked();
            fireEvent.keyDown(checkbox, { key: ' ', code: 'Space' });
            expect(checkbox).not.toBeChecked();
        });
    });

    describe('Additional Props', () => {
        it('should pass through additional props to input', () => {
            render(
                <Checkbox
                    label="Include clones"
                    name="includeClones"
                    data-testid="test-checkbox"
                />
            );
            const checkbox = screen.getByTestId('test-checkbox');
            expect(checkbox).toBeInTheDocument();
        });

        it('should pass through value prop', () => {
            render(
                <Checkbox
                    label="Include clones"
                    name="includeClones"
                    value="clones"
                />
            );
            const checkbox = screen.getByRole('checkbox');
            expect(checkbox).toHaveAttribute('value', 'clones');
        });

        it('should pass through defaultChecked prop', () => {
            render(
                <Checkbox
                    label="Include clones"
                    name="includeClones"
                    defaultChecked
                />
            );
            const checkbox = screen.getByRole('checkbox');
            expect(checkbox).toBeChecked();
        });

        it('should pass through autoFocus prop', () => {
            render(
                <Checkbox
                    label="Include clones"
                    name="includeClones"
                    autoFocus
                />
            );
            const checkbox = screen.getByRole('checkbox');
            // expect(checkbox).toHaveAttribute('autofocus');
            expect(checkbox).toHaveFocus();
        });
    });

    describe('Edge Cases', () => {
        it('should render with empty label', () => {
            render(<Checkbox label="" name="includeClones" />);
            const checkbox = screen.getByRole('checkbox');
            expect(checkbox).toBeInTheDocument();
        });

        it('should render with long label', () => {
            const longLabel = 'This is a very long label that might wrap to multiple lines in the UI';
            render(<Checkbox label={longLabel} name="includeClones" />);
            const label = screen.getByText(longLabel);
            expect(label).toBeInTheDocument();
        });

        it('should render with special characters in label', () => {
            render(<Checkbox label="Include & items" name="includeClones" />);
            const label = screen.getByText('Include & items');
            expect(label).toBeInTheDocument();
        });
    });
});
