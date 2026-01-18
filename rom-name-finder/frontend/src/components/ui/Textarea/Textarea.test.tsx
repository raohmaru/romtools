import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Textarea } from './Textarea';

describe('Textarea', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render with label', () => {
            render(<Textarea label="Game Names" name="games" />);
            const label = screen.getByLabelText('Game Names');
            expect(label).toBeInTheDocument();
        });

        it('should render with placeholder', () => {
            render(
                <Textarea
                    label="Game Names"
                    name="games"
                    placeholder="Enter game names..."
                />
            );
            const textarea = screen.getByPlaceholderText('Enter game names...');
            expect(textarea).toBeInTheDocument();
        });

        it('should render with default value', () => {
            render(
                <Textarea
                    label="Game Names"
                    name="games"
                    defaultValue="Pacman"
                />
            );
            const textarea = screen.getByLabelText('Game Names');
            expect(textarea).toHaveValue('Pacman');
        });

        it('should render with custom className', () => {
            render(
                <Textarea
                    label="Game Names"
                    name="games"
                    className="custom-class"
                />
            );
            const wrapper = screen.getByText('Game Names').closest('div');
            expect(wrapper).toHaveClass('custom-class');
        });

        it('should render with required indicator', () => {
            render(<Textarea label="Game Names" name="games" required />);
            const label = screen.getByText('*');
            expect(label).toBeInTheDocument();
        });

        it('should render with custom id', () => {
            render(
                <Textarea
                    label="Game Names"
                    name="games"
                    id="custom-id"
                />
            );
            const textarea = screen.getByRole('textbox');
            expect(textarea).toHaveAttribute('id', 'custom-id');
        });
    });

    describe('Value Changes', () => {
        it('should update value on user input', () => {
            render(<Textarea label="Game Names" name="games" />);
            const textarea = screen.getByLabelText('Game Names');
            fireEvent.change(textarea, { target: { value: 'Pacman' } });
            expect(textarea).toHaveValue('Pacman');
        });

        it('should update value on multiple lines', () => {
            render(<Textarea label="Game Names" name="games" />);
            const textarea = screen.getByLabelText('Game Names');
            fireEvent.change(textarea, { target: { value: 'Pacman\nSpace Invaders' } });
            expect(textarea).toHaveValue('Pacman\nSpace Invaders');
        });

        it('should display game count when text is entered', async () => {
            render(<Textarea label="Game Names" name="games" />);
            const textarea = screen.getByLabelText('Game Names');
            fireEvent.change(textarea, { target: { value: 'Pacman' } });
            fireEvent.keyUp(textarea, { key: 'Enter' });
            const label = screen.getByText(/Game Names \(1\)/);
            expect(label).toBeInTheDocument();
        });

        it('should display game count for multiple lines', async () => {
            render(<Textarea label="Game Names" name="games" />);
            const textarea = screen.getByLabelText('Game Names');
            fireEvent.change(textarea, { target: { value: 'Pacman\nSpace Invaders\nDonkey Kong' } });
            fireEvent.keyUp(textarea, { key: 'Enter' });
            const label = screen.getByText(/Game Names \(3\)/);
            expect(label).toBeInTheDocument();
        });

        it('should not count empty lines', async () => {
            render(<Textarea label="Game Names" name="games" />);
            const textarea = screen.getByLabelText('Game Names');
            fireEvent.change(textarea, { target: { value: 'Pacman\n\nSpace Invaders' } });
            fireEvent.keyUp(textarea, { key: 'Enter' });
            const label = screen.getByText(/Game Names \(2\)/);
            expect(label).toBeInTheDocument();
        });
    });

    describe('Error State', () => {
        it('should render error message when error prop is provided', () => {
            render(
                <Textarea
                    label="Game Names"
                    name="games"
                    error="This field is required"
                />
            );
            const errorMessage = screen.getByText('This field is required');
            expect(errorMessage).toBeInTheDocument();
        });

        it('should set aria-invalid to true when error is present', () => {
            render(
                <Textarea
                    label="Game Names"
                    name="games"
                    error="This field is required"
                />
            );
            const textarea = screen.getByLabelText('Game Names');
            expect(textarea).toHaveAttribute('aria-invalid', 'true');
        });

        it('should set aria-invalid to false when no error', () => {
            render(<Textarea label="Game Names" name="games" />);
            const textarea = screen.getByLabelText('Game Names');
            expect(textarea).toHaveAttribute('aria-invalid', 'false');
        });

        it('should link error message with aria-describedby', () => {
            render(
                <Textarea
                    label="Game Names"
                    name="games"
                    error="This field is required"
                />
            );
            const textarea = screen.getByLabelText('Game Names');
            const errorId = textarea.getAttribute('aria-describedby');
            const errorMessage = screen.getByText('This field is required');
            expect(errorMessage).toHaveAttribute('id', errorId);
        });

        it('should have error message with role="alert"', () => {
            render(
                <Textarea
                    label="Game Names"
                    name="games"
                    error="This field is required"
                />
            );
            const errorMessage = screen.getByText('This field is required');
            expect(errorMessage).toHaveAttribute('role', 'alert');
        });
    });

    describe('Accessibility', () => {
        it('should have proper label association', () => {
            render(<Textarea label="Game Names" name="games" />);
            const textarea = screen.getByLabelText('Game Names');
            expect(textarea).toBeInTheDocument();
        });

        it('should have aria-required attribute when required', () => {
            render(<Textarea label="Game Names" name="games" required />);
            const textarea = document.querySelector('textarea[name="games"]');
            expect(textarea).toHaveAttribute('aria-required', 'true');
        });

        it('should have aria-describedby when error is present', () => {
            render(
                <Textarea
                    label="Game Names"
                    name="games"
                    error="This field is required"
                />
            );
            const textarea = screen.getByLabelText('Game Names');
            expect(textarea).toHaveAttribute('aria-describedby');
        });

        it('should have error message with role="alert"', () => {
            render(
                <Textarea
                    label="Game Names"
                    name="games"
                    error="This field is required"
                />
            );
            const errorMessage = screen.getByText('This field is required');
            expect(errorMessage).toHaveAttribute('role', 'alert');
        });

        it('should be keyboard accessible', () => {
            render(<Textarea label="Game Names" name="games" />);
            const textarea = screen.getByLabelText('Game Names');
            expect(textarea.tagName).toBe('TEXTAREA');
        });

        it('should call onSubmit when Ctrl+Enter is pressed', () => {
            const handleSubmit = vi.fn();
            render(
                <Textarea
                    label="Game Names"
                    name="games"
                    onSubmit={handleSubmit}
                />
            );
            const textarea = screen.getByLabelText('Game Names');
            fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true });
            expect(handleSubmit).toHaveBeenCalledTimes(1);
        });

        it('should not call onSubmit when Enter is pressed without Ctrl', () => {
            const handleSubmit = vi.fn();
            render(
                <Textarea
                    label="Game Names"
                    name="games"
                    onSubmit={handleSubmit}
                />
            );
            const textarea = screen.getByLabelText('Game Names');
            fireEvent.keyDown(textarea, { key: 'Enter' });
            expect(handleSubmit).not.toHaveBeenCalled();
        });
    });

    describe('Drag and Drop', () => {
        it('should show drop overlay on drag enter', () => {
            render(<Textarea label="Game Names" name="games" />);
            const wrapper = screen.getByText('Game Names').closest('div')?.nextElementSibling;
            if (wrapper) {
                fireEvent.dragEnter(wrapper);
                const dropOverlay = screen.getByText('Drop file here');
                expect(dropOverlay).toBeInTheDocument();
            }
        });

        it('should hide drop overlay on drag leave', () => {
            render(<Textarea label="Game Names" name="games" />);
            const wrapper = screen.getByText('Game Names').closest('div')?.nextElementSibling;
            if (wrapper) {
                fireEvent.dragEnter(wrapper);
                fireEvent.dragLeave(wrapper);
                const dropOverlay = screen.queryByText('Drop file here');
                expect(dropOverlay).not.toBeInTheDocument();
            }
        });

        it('should handle file drop', async () => {
            const file = new File(['Pacman\nSpace Invaders'], 'games.txt', { type: 'text/plain' });
            render(<Textarea label="Game Names" name="games" />);
            const wrapper = screen.getByText('Game Names').closest('div')?.nextElementSibling;
            if (wrapper) {
                const textarea = screen.getByLabelText('Game Names');
                fireEvent.drop(wrapper, {
                    dataTransfer: {
                        files: [file],
                    },
                });
                // Wait for async file reading
                await new Promise(resolve => setTimeout(resolve, 100));
                expect(textarea).toHaveValue('Pacman\nSpace Invaders');
            }
        });

        it('should show error for large files', async () => {
            // Create a file larger than 100KB
            const largeContent = 'x'.repeat(101 * 1024);
            const file = new File([largeContent], 'large.txt', { type: 'text/plain' });
            render(<Textarea label="Game Names" name="games" />);
            const wrapper = screen.getByText('Game Names').closest('div')?.nextElementSibling;
            if (wrapper) {
                fireEvent.drop(wrapper, {
                    dataTransfer: {
                        files: [file],
                    },
                });
                await new Promise(resolve => setTimeout(resolve, 100));
                const errorMessage = screen.getByText(/File size exceeds/);
                expect(errorMessage).toBeInTheDocument();
            }
        });
    });

    describe('Additional Props', () => {
        it('should pass through additional props to textarea', () => {
            render(
                <Textarea
                    label="Game Names"
                    name="games"
                    data-testid="test-textarea"
                />
            );
            const textarea = screen.getByTestId('test-textarea');
            expect(textarea).toBeInTheDocument();
        });

        it('should pass through rows prop', () => {
            render(
                <Textarea
                    label="Game Names"
                    name="games"
                    rows={10}
                />
            );
            const textarea = screen.getByLabelText('Game Names');
            expect(textarea).toHaveAttribute('rows', '10');
        });

        it('should pass through disabled prop', () => {
            render(
                <Textarea
                    label="Game Names"
                    name="games"
                    disabled
                />
            );
            const textarea = screen.getByLabelText('Game Names');
            expect(textarea).toBeDisabled();
        });
    });
});
