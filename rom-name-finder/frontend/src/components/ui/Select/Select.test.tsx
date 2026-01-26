import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Select, type SelectOption } from './Select';
import { ERR_DB_SELECT } from '../../../utils/constants';

describe('Select', () => {
    const mockOptions: SelectOption[] = [
        { value: 'mame2003', label: 'MAME 2003 Plus' },
        { value: 'mame2010', label: 'MAME 2010' },
        { value: 'mame2015', label: 'MAME 2015' },
    ];

    describe('Rendering', () => {
        it('should render with label', () => {
            render(<Select label="ROMset" name="romset" options={mockOptions} />);
            const label = screen.getByLabelText('ROMset');
            expect(label).toBeInTheDocument();
        });

        it('should render with options', () => {
            render(<Select label="ROMset" name="romset" options={mockOptions} />);
            const options = screen.getAllByRole('option');
            expect(options).toHaveLength(3);
        });

        it('should render with placeholder option', () => {
            render(
                <Select
                    label="ROMset"
                    name="romset"
                    options={mockOptions}
                    placeholder="Select a ROMset"
                />
            );
            const placeholderOption = screen.getByText('Select a ROMset');
            expect(placeholderOption).toBeInTheDocument();
            expect(placeholderOption).toBeDisabled();
        });

        it('should render with custom className', () => {
            render(
                <Select
                    label="ROMset"
                    name="romset"
                    options={mockOptions}
                    className="custom-class"
                />
            );
            const wrapper = screen.getByText('ROMset').closest('div');
            expect(wrapper).toHaveClass('custom-class');
        });

        it('should render with required indicator', () => {
            render(
                <Select
                    label="ROMset"
                    name="romset"
                    options={mockOptions}
                    required
                />
            );
            const label = screen.getByText('*');
            expect(label).toBeDefined();
        });

        it('should render with custom id', () => {
            render(
                <Select
                    label="ROMset"
                    name="romset"
                    options={mockOptions}
                    id="custom-id"
                />
            );
            const select = screen.getByRole('combobox');
            expect(select).toHaveAttribute('id', 'custom-id');
        });

        it('should render options with labels', () => {
            render(<Select label="ROMset" name="romset" options={mockOptions} />);
            expect(screen.getByText('MAME 2003 Plus')).toBeInTheDocument();
            expect(screen.getByText('MAME 2010')).toBeInTheDocument();
            expect(screen.getByText('MAME 2015')).toBeInTheDocument();
        });

        it('should render options without labels using value', () => {
            const optionsWithoutLabels: SelectOption[] = [
                { value: 'option1' },
                { value: 'option2' },
            ];
            render(
                <Select
                    label="Options"
                    name="options"
                    options={optionsWithoutLabels}
                />
            );
            expect(screen.getByText('option1')).toBeInTheDocument();
            expect(screen.getByText('option2')).toBeInTheDocument();
        });
    });

    describe('Option Selection', () => {
        it('should allow selecting an option', () => {
            render(<Select label="ROMset" name="romset" options={mockOptions} />);
            const select = screen.getByRole('combobox');
            fireEvent.change(select, { target: { value: 'mame2010' } });
            expect(select).toHaveValue('mame2010');
        });

        it('should update selected value on change', () => {
            render(<Select label="ROMset" name="romset" options={mockOptions} />);
            const select = screen.getByRole('combobox');
            fireEvent.change(select, { target: { value: 'mame2010' } });
            expect(select).toHaveValue('mame2010');
            fireEvent.change(select, { target: { value: 'mame2015' } });
            expect(select).toHaveValue('mame2015');
        });

        it('should have correct option values', () => {
            render(<Select label="ROMset" name="romset" options={mockOptions} />);
            const select = screen.getByRole('combobox');
            const options = Array.from(select.querySelectorAll('option'));
            expect(options[0]).toHaveValue('mame2003');
            expect(options[1]).toHaveValue('mame2010');
            expect(options[2]).toHaveValue('mame2015');
        });
    });

    describe('Disabled State', () => {
        it('should render with disabled attribute when disabled', () => {
            render(
                <Select
                    label="ROMset"
                    name="romset"
                    options={mockOptions}
                    disabled
                />
            );
            const select = screen.getByRole('combobox');
            expect(select).toBeDisabled();
        });
    });

    describe('Error State', () => {
        it('should render error message when error prop is provided', () => {
            render(
                <Select
                    label="ROMset"
                    name="romset"
                    options={mockOptions}
                    error={ERR_DB_SELECT}
                />
            );
            const errorMessage = screen.getByText(ERR_DB_SELECT);
            expect(errorMessage).toBeInTheDocument();
        });

        it('should set aria-invalid to true when error is present', () => {
            render(
                <Select
                    label="ROMset"
                    name="romset"
                    options={mockOptions}
                    error={ERR_DB_SELECT}
                />
            );
            const select = screen.getByRole('combobox');
            expect(select).toHaveAttribute('aria-invalid', 'true');
        });

        it('should set aria-invalid to false when no error', () => {
            render(<Select label="ROMset" name="romset" options={mockOptions} />);
            const select = screen.getByRole('combobox');
            expect(select).toHaveAttribute('aria-invalid', 'false');
        });

        it('should link error message with aria-describedby', () => {
            render(
                <Select
                    label="ROMset"
                    name="romset"
                    options={mockOptions}
                    error={ERR_DB_SELECT}
                />
            );
            const select = screen.getByRole('combobox');
            const errorId = select.getAttribute('aria-describedby');
            const errorMessage = screen.getByText(ERR_DB_SELECT);
            expect(errorMessage).toHaveAttribute('id', errorId);
        });

        it('should have error message with role="alert"', () => {
            render(
                <Select
                    label="ROMset"
                    name="romset"
                    options={mockOptions}
                    error={ERR_DB_SELECT}
                />
            );
            const errorMessage = screen.getByText(ERR_DB_SELECT);
            expect(errorMessage).toHaveAttribute('role', 'alert');
        });
    });

    describe('Accessibility', () => {
        it('should have proper label association', () => {
            render(<Select label="ROMset" name="romset" options={mockOptions} />);
            const select = screen.getByLabelText('ROMset');
            expect(select).toBeInTheDocument();
        });

        it('should have aria-required attribute when required', () => {
            render(
                <Select
                    label="ROMset"
                    name="romset"
                    options={mockOptions}
                    required
                />
            );
            const select = screen.getByRole('combobox');
            expect(select).toHaveAttribute('aria-required', 'true');
        });

        it('should have aria-describedby when error is present', () => {
            render(
                <Select
                    label="ROMset"
                    name="romset"
                    options={mockOptions}
                    error={ERR_DB_SELECT}
                />
            );
            const select = screen.getByRole('combobox');
            expect(select).toHaveAttribute('aria-describedby');
        });

        it('should have role="combobox"', () => {
            render(<Select label="ROMset" name="romset" options={mockOptions} />);
            const select = screen.getByRole('combobox');
            expect(select).toBeInTheDocument();
        });

        it('should be keyboard accessible', () => {
            render(<Select label="ROMset" name="romset" options={mockOptions} />);
            const select = screen.getByRole('combobox');
            expect(select.tagName).toBe('SELECT');
        });
    });

    describe('Edge Cases', () => {
        it('should render with empty options array', () => {
            render(
                <Select
                    label="ROMset"
                    name="romset"
                    options={[]}
                />
            );
            const options = screen.queryAllByRole('option');
            expect(options).toHaveLength(0);
        });

        it('should render with single option', () => {
            const singleOption: SelectOption[] = [
                { value: 'mame2003', label: 'MAME 2003 Plus' },
            ];
            render(
                <Select
                    label="ROMset"
                    name="romset"
                    options={singleOption}
                />
            );
            const options = screen.getAllByRole('option');
            expect(options).toHaveLength(1);
        });
    });

    describe('Additional Props', () => {
        it('should pass through additional props to select', () => {
            render(
                <Select
                    label="ROMset"
                    name="romset"
                    options={mockOptions}
                    data-testid="test-select"
                />
            );
            const select = screen.getByTestId('test-select');
            expect(select).toBeInTheDocument();
        });

        it('should pass through defaultValue prop', () => {
            render(
                <Select
                    label="ROMset"
                    name="romset"
                    options={mockOptions}
                    defaultValue="mame2010"
                />
            );
            const select = screen.getByRole('combobox');
            expect(select).toHaveValue('mame2010');
        });

        it('should pass through onChange handler', () => {
            const handleChange = vi.fn();
            render(
                <Select
                    label="ROMset"
                    name="romset"
                    options={mockOptions}
                    onChange={handleChange}
                />
            );
            const select = screen.getByRole('combobox');
            fireEvent.change(select, { target: { value: 'mame2010' } });
            expect(handleChange).toHaveBeenCalled();
        });
    });
});
