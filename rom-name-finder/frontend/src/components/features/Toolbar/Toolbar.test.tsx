import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Toolbar } from './Toolbar';

describe('Toolbar', () => {
    const mockOnCopy = vi.fn();
    const mockOnExport = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render all buttons', () => {
            render(
                <Toolbar
                    onCopy={mockOnCopy}
                    onExport={mockOnExport}
                />
            );

            expect(screen.getByLabelText('Simple view')).toBeInTheDocument();
            expect(screen.getByLabelText('Detailed view')).toBeInTheDocument();
            expect(screen.getByLabelText('Copy ROM names to clipboard')).toBeInTheDocument();
            expect(screen.getByLabelText('Export as CSV')).toBeInTheDocument();
        });

        it('should render with simple view active when viewMode is simple', () => {
            render(
                <Toolbar
                    onCopy={mockOnCopy}
                    onExport={mockOnExport}
                />
            );

            const simpleButton = screen.getByLabelText('Simple view');
            fireEvent.click(simpleButton);
            const detailedButton = screen.getByLabelText('Detailed view');

            expect(simpleButton).toHaveAttribute('aria-pressed', 'true');
            expect(detailedButton).toHaveAttribute('aria-pressed', 'false');
        });

        it('should render with detailed view active when viewMode is detailed', () => {
            render(
                <Toolbar
                    onCopy={mockOnCopy}
                    onExport={mockOnExport}
                />
            );

            const simpleButton = screen.getByLabelText('Simple view');
            const detailedButton = screen.getByLabelText('Detailed view');
            fireEvent.click(detailedButton);

            expect(simpleButton).toHaveAttribute('aria-pressed', 'false');
            expect(detailedButton).toHaveAttribute('aria-pressed', 'true');
        });

        it('should render with role="group"', () => {
            render(
                <Toolbar
                    onCopy={mockOnCopy}
                    onExport={mockOnExport}
                />
            );

            const toolbar = screen.getByRole('group');
            expect(toolbar).toBeInTheDocument();
        });

        it('should render with aria-label="Toolbar"', () => {
            render(
                <Toolbar
                    onCopy={mockOnCopy}
                    onExport={mockOnExport}
                />
            );

            const toolbar = screen.getByRole('group', { name: 'Toolbar' });
            expect(toolbar).toBeInTheDocument();
        });
    });

    describe('View Toggle', () => {
        it('should update aria-pressed when view changes', () => {
            render(
                <Toolbar
                    onCopy={mockOnCopy}
                    onExport={mockOnExport}
                />
            );

            const simpleButton = screen.getByLabelText('Simple view');
            const detailedButton = screen.getByLabelText('Detailed view');

            fireEvent.click(simpleButton);

            expect(simpleButton).toHaveAttribute('aria-pressed', 'true');
            expect(detailedButton).toHaveAttribute('aria-pressed', 'false');

            fireEvent.click(detailedButton);

            expect(simpleButton).toHaveAttribute('aria-pressed', 'false');
            expect(detailedButton).toHaveAttribute('aria-pressed', 'true');
        });
    });

    describe('Copy Functionality', () => {
        it('should call onCopy when copy button is clicked', () => {
            render(
                <Toolbar
                    onCopy={mockOnCopy}
                    onExport={mockOnExport}
                />
            );

            const copyButton = screen.getByLabelText('Copy ROM names to clipboard');
            fireEvent.click(copyButton);

            expect(mockOnCopy).toHaveBeenCalledTimes(1);
        });

        it('should show checkmark after copy', async () => {
            render(
                <Toolbar
                    onCopy={mockOnCopy}
                    onExport={mockOnExport}
                />
            );

            const copyButton = screen.getByLabelText('Copy ROM names to clipboard');
            fireEvent.click(copyButton);

            const checkmark = screen.getByText('✔');
            expect(checkmark).toBeInTheDocument();
        });

        it('should reset to clipboard icon after timeout', async () => {
            render(
                <Toolbar
                    onCopy={mockOnCopy}
                    onExport={mockOnExport}
                />
            );

            const copyButton = screen.getByLabelText('Copy ROM names to clipboard');

            await act(async () => {
                fireEvent.click(copyButton);
                await new Promise(resolve => setTimeout(resolve, 1100));
            });

            const clipboardIcon = screen.getByText('📋');
            expect(clipboardIcon).toBeInTheDocument();
        });
    });

    describe('Export Functionality', () => {
        it('should call onExport when export button is clicked', () => {
            render(
                <Toolbar
                    onCopy={mockOnCopy}
                    onExport={mockOnExport}
                />
            );

            const exportButton = screen.getByLabelText('Export as CSV');
            fireEvent.click(exportButton);

            expect(mockOnExport).toHaveBeenCalledTimes(1);
        });
    });

    describe('Accessibility', () => {
        it('should have role="group"', () => {
            render(
                <Toolbar
                    onCopy={mockOnCopy}
                    onExport={mockOnExport}
                />
            );

            const toolbar = screen.getByRole('group');
            expect(toolbar).toBeInTheDocument();
        });

        it('should have aria-label="Toolbar"', () => {
            render(
                <Toolbar
                    onCopy={mockOnCopy}
                    onExport={mockOnExport}
                />
            );

            const toolbar = screen.getByRole('group', { name: 'Toolbar' });
            expect(toolbar).toBeInTheDocument();
        });

        it('should have aria-label on all buttons', () => {
            render(
                <Toolbar
                    onCopy={mockOnCopy}
                    onExport={mockOnExport}
                />
            );

            expect(screen.getByLabelText('Simple view')).toBeInTheDocument();
            expect(screen.getByLabelText('Detailed view')).toBeInTheDocument();
            expect(screen.getByLabelText('Copy ROM names to clipboard')).toBeInTheDocument();
            expect(screen.getByLabelText('Export as CSV')).toBeInTheDocument();
        });

        it('should have aria-pressed on view toggle buttons', () => {
            render(
                <Toolbar
                    onCopy={mockOnCopy}
                    onExport={mockOnExport}
                />
            );

            const simpleButton = screen.getByLabelText('Simple view');
            const detailedButton = screen.getByLabelText('Detailed view');

            expect(simpleButton).toHaveAttribute('aria-pressed');
            expect(detailedButton).toHaveAttribute('aria-pressed');
        });

        it('should have title attributes on buttons', () => {
            render(
                <Toolbar
                    onCopy={mockOnCopy}
                    onExport={mockOnExport}
                />
            );

            const simpleButton = screen.getByLabelText('Simple view');
            const detailedButton = screen.getByLabelText('Detailed view');
            const copyButton = screen.getByLabelText('Copy ROM names to clipboard');
            const exportButton = screen.getByLabelText('Export as CSV');

            expect(simpleButton).toHaveAttribute('title', 'Simple view');
            expect(detailedButton).toHaveAttribute('title', 'Detailed view');
            expect(copyButton).toHaveAttribute('title', 'Copy ROM names to clipboard');
            expect(exportButton).toHaveAttribute('title', 'Export as CSV');
        });

        it('should have aria-hidden on button icons', () => {
            render(
                <Toolbar
                    onCopy={mockOnCopy}
                    onExport={mockOnExport}
                />
            );

            const icons = screen.getAllByLabelText(/view|Copy|Export/);
            icons.forEach(icon => {
                const iconSpan = icon.querySelector('[aria-hidden]');
                expect(iconSpan).toBeInTheDocument();
            });
        });

        it('should be keyboard navigable', () => {
            render(
                <Toolbar
                    onCopy={mockOnCopy}
                    onExport={mockOnExport}
                />
            );

            const buttons = screen.getAllByRole('button');
            buttons.forEach(button => {
                expect(button.tagName).toBe('BUTTON');
            });
        });
    });

    describe('Edge Cases', () => {
        it('should handle rapid copy clicks', () => {
            render(
                <Toolbar
                    onCopy={mockOnCopy}
                    onExport={mockOnExport}
                />
            );

            const copyButton = screen.getByLabelText('Copy ROM names to clipboard');
            fireEvent.click(copyButton);
            fireEvent.click(copyButton);
            fireEvent.click(copyButton);

            expect(mockOnCopy).toHaveBeenCalledTimes(3);
        });

        it('should handle rapid view toggles', () => {
            render(
                <Toolbar
                    onCopy={mockOnCopy}
                    onExport={mockOnExport}
                />
            );

            const simpleButton = screen.getByLabelText('Simple view');
            const detailedButton = screen.getByLabelText('Detailed view');

            fireEvent.click(simpleButton);
            fireEvent.click(detailedButton);
            fireEvent.click(simpleButton);

            expect(simpleButton).toBeInTheDocument();
            expect(detailedButton).toBeInTheDocument();
        });
    });
});
