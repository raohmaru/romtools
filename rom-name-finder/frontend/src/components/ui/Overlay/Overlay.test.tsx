import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Overlay } from './Overlay';

describe('Overlay', () => {
    describe('Rendering', () => {
        it('should render with visible=true by default', () => {
            render(
                <Overlay>
                    <div>Overlay content</div>
                </Overlay>
            );
            const overlay = screen.getByRole('dialog');
            expect(overlay).toBeInTheDocument();
        });

        it('should render with visible=true', () => {
            render(
                <Overlay visible>
                    <div>Overlay content</div>
                </Overlay>
            );
            const overlay = screen.getByRole('dialog');
            expect(overlay).toBeInTheDocument();
        });

        it('should not render with visible=false', () => {
            render(
                <Overlay visible={false}>
                    <div>Overlay content</div>
                </Overlay>
            );
            const overlay = screen.queryByRole('dialog');
            expect(overlay).not.toBeInTheDocument();
        });

        it('should render children content', () => {
            render(
                <Overlay>
                    <div>Overlay content</div>
                </Overlay>
            );
            const content = screen.getByText('Overlay content');
            expect(content).toBeInTheDocument();
        });

        it('should render with custom className', () => {
            render(
                <Overlay className="custom-class">
                    <div>Overlay content</div>
                </Overlay>
            );
            const overlay = screen.getByRole('dialog');
            expect(overlay).toHaveClass('custom-class');
        });

        it('should render with multiple children', () => {
            render(
                <Overlay>
                    <div>Child 1</div>
                    <div>Child 2</div>
                    <div>Child 3</div>
                </Overlay>
            );
            expect(screen.getByText('Child 1')).toBeInTheDocument();
            expect(screen.getByText('Child 2')).toBeInTheDocument();
            expect(screen.getByText('Child 3')).toBeInTheDocument();
        });

        it('should render with nested elements', () => {
            render(
                <Overlay>
                    <div>
                        <span>Nested content</span>
                    </div>
                </Overlay>
            );
            expect(screen.getByText('Nested content')).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('should have role="dialog"', () => {
            render(
                <Overlay>
                    <div>Overlay content</div>
                </Overlay>
            );
            const overlay = screen.getByRole('dialog');
            expect(overlay).toBeInTheDocument();
        });

        it('should have aria-hidden="false" when visible', () => {
            render(
                <Overlay visible>
                    <div>Overlay content</div>
                </Overlay>
            );
            const overlay = screen.getByRole('dialog');
            expect(overlay).toHaveAttribute('aria-hidden', 'false');
        });

        it('should have aria-hidden="true" when not visible', () => {
            render(
                <Overlay visible={false}>
                    <div>Overlay content</div>
                </Overlay>
            );
            const overlay = screen.queryByRole('dialog');
            expect(overlay).not.toBeInTheDocument();
        });

        it('should be accessible to screen readers when visible', () => {
            render(
                <Overlay>
                    <div>Overlay content</div>
                </Overlay>
            );
            const overlay = screen.getByRole('dialog');
            expect(overlay).toHaveAttribute('aria-hidden', 'false');
        });
    });

    describe('Additional Props', () => {
        it('should pass through additional props to div', () => {
            render(
                <Overlay data-testid="test-overlay">
                    <div>Overlay content</div>
                </Overlay>
            );
            const overlay = screen.getByTestId('test-overlay');
            expect(overlay).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('should render with null children', () => {
            render(<Overlay>{null}</Overlay>);
            const overlay = screen.getByRole('dialog');
            expect(overlay).toBeInTheDocument();
        });

        it('should render with undefined children', () => {
            render(<Overlay>{undefined}</Overlay>);
            const overlay = screen.getByRole('dialog');
            expect(overlay).toBeInTheDocument();
        });

        it('should render with empty string children', () => {
            render(<Overlay>{''}</Overlay>);
            const overlay = screen.getByRole('dialog');
            expect(overlay).toBeInTheDocument();
        });

        it('should render with complex children', () => {
            render(
                <Overlay>
                    <div>
                        <h1>Title</h1>
                        <p>Paragraph</p>
                        <button>Button</button>
                    </div>
                </Overlay>
            );
            expect(screen.getByText('Title')).toBeInTheDocument();
            expect(screen.getByText('Paragraph')).toBeInTheDocument();
            expect(screen.getByText('Button')).toBeInTheDocument();
        });
    });
});
