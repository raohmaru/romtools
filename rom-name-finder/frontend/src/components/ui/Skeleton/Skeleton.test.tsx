import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Skeleton, SkeletonText, SkeletonCard } from './Skeleton';

describe('Skeleton', () => {
    describe('Rendering', () => {
        it('should render with default props', () => {
            render(<Skeleton hidden={false} />);
            const skeleton = screen.getByRole('presentation');
            expect(skeleton).toBeInTheDocument();
        });

        it('should render with custom width', () => {
            render(<Skeleton hidden={false} width="200px" />);
            const skeleton = screen.getByRole('presentation');
            expect(skeleton).toBeInTheDocument();
            expect(skeleton).toHaveStyle({ width: '200px' });
        });

        it('should render with custom height', () => {
            render(<Skeleton hidden={false} height="50px" />);
            const skeleton = screen.getByRole('presentation');
            expect(skeleton).toBeInTheDocument();
            expect(skeleton).toHaveStyle({ height: '50px' });
        });

        it('should render with custom borderRadius', () => {
            render(<Skeleton hidden={false} borderRadius="10px" />);
            const skeleton = screen.getByRole('presentation');
            expect(skeleton).toBeInTheDocument();
            expect(skeleton).toHaveStyle({ borderRadius: '10px' });
        });

        it('should render with custom className', () => {
            render(<Skeleton hidden={false} className="custom-class" />);
            const skeleton = screen.getByRole('presentation');
            expect(skeleton).toHaveClass('custom-class');
        });

        it('should render with numeric width', () => {
            render(<Skeleton hidden={false} width={200} />);
            const skeleton = screen.getByRole('presentation');
            expect(skeleton).toHaveStyle({ width: '200px' });
        });

        it('should render with numeric height', () => {
            render(<Skeleton hidden={false} height={50} />);
            const skeleton = screen.getByRole('presentation');
            expect(skeleton).toHaveStyle({ height: '50px' });
        });

        it('should render with numeric borderRadius', () => {
            render(<Skeleton hidden={false} borderRadius={10} />);
            const skeleton = screen.getByRole('presentation');
            expect(skeleton).toHaveStyle({ borderRadius: '10px' });
        });

        it('should render with percentage width', () => {
            render(<Skeleton hidden={false} width="50%" />);
            const skeleton = screen.getByRole('presentation');
            expect(skeleton).toHaveStyle({ width: '50%' });
        });

        it('should render with percentage height', () => {
            render(<Skeleton hidden={false} height="100%" />);
            const skeleton = screen.getByRole('presentation');
            expect(skeleton).toHaveStyle({ height: '100%' });
        });
    });

    describe('Accessibility', () => {
        it('should have aria-hidden="true"', () => {
            render(<Skeleton />);
            const skeleton = document.querySelector('.skeleton');
            expect(skeleton).toHaveAttribute('aria-hidden', 'true');
        });

        it('should be hidden from screen readers', () => {
            render(<Skeleton />);
            const skeleton = document.querySelector('.skeleton');
            expect(skeleton).toHaveAttribute('aria-hidden', 'true');
        });
    });

    describe('Additional Props', () => {
        it('should pass through additional props to div', () => {
            render(<Skeleton data-testid="test-skeleton" />);
            const skeleton = screen.getByTestId('test-skeleton');
            expect(skeleton).toBeInTheDocument();
        });
    });
});

describe('SkeletonText', () => {
    describe('Rendering', () => {
        it('should render with default 3 lines', () => {
            render(<SkeletonText hidden={false} />);
            const skeletons = screen.getAllByRole('presentation');
            expect(skeletons).toHaveLength(3);
        });

        it('should render with custom number of lines', () => {
            render(<SkeletonText hidden={false} lines={5} />);
            const skeletons = screen.getAllByRole('presentation');
            expect(skeletons).toHaveLength(5);
        });

        it('should render with custom lineHeight', () => {
            render(<SkeletonText hidden={false} lineHeight="2rem" />);
            const skeletons = screen.getAllByRole('presentation');
            skeletons.forEach(skeleton => {
                expect(skeleton).toHaveStyle({ height: '2rem' });
            });
        });

        it('should render with custom gap', () => {
            render(<SkeletonText hidden={false} gap="1rem" />);
            const container = screen.getAllByRole('presentation')[0].parentElement;
            expect(container).toHaveStyle({ gap: '1rem' });
        });

        it('should render last line shorter', () => {
            render(<SkeletonText hidden={false} lines={3} />);
            const skeletons = screen.getAllByRole('presentation');
            expect(skeletons[2]).toHaveStyle({ width: '60%' });
        });

        it('should render all lines except last at full width', () => {
            render(<SkeletonText hidden={false} lines={3} />);
            const skeletons = screen.getAllByRole('presentation');
            expect(skeletons[0]).toHaveStyle({ width: '100%' });
            expect(skeletons[1]).toHaveStyle({ width: '100%' });
        });
    });

    describe('Accessibility', () => {
        it('should have all skeletons with aria-hidden="true"', () => {
            render(<SkeletonText />);
            const skeletons = document.querySelectorAll('.skeleton');
            skeletons.forEach(skeleton => {
                expect(skeleton).toHaveAttribute('aria-hidden', 'true');
            });
        });
    });

    describe('Additional Props', () => {
        it('should pass through additional props', () => {
            render(<SkeletonText data-testid="test-text" />);
            const card = screen.getByTestId('test-text');
            expect(card).toBeInTheDocument();
        });
    });
});

describe('SkeletonCard', () => {
    describe('Rendering', () => {
        it('should render card structure', () => {
            render(<SkeletonCard />);
            const card = screen.getByRole('status');
            expect(card).toBeInTheDocument();
        });

        it('should render title skeleton', () => {
            render(<SkeletonCard hidden={false} />);
            const skeletons = screen.getAllByRole('presentation');
            const titleSkeleton = skeletons.find(s => s.style.width === '60%');
            expect(titleSkeleton).toBeInTheDocument();
        });

        it('should render text skeletons', () => {
            render(<SkeletonCard hidden={false} />);
            const skeletons = screen.getAllByRole('presentation');
            expect(skeletons.length).toBeGreaterThan(1);
        });
    });

    describe('Accessibility', () => {
        it('should have role="status"', () => {
            render(<SkeletonCard />);
            const card = screen.getByRole('status');
            expect(card).toBeInTheDocument();
        });

        it('should have aria-label="Loading content"', () => {
            render(<SkeletonCard />);
            const card = screen.getByRole('status', { name: 'Loading content' });
            expect(card).toBeInTheDocument();
        });

        it('should have all skeletons with aria-hidden="true"', () => {
            render(<SkeletonCard />);
            const skeletons = document.querySelectorAll('.skeleton');
            skeletons.forEach(skeleton => {
                expect(skeleton).toHaveAttribute('aria-hidden', 'true');
            });
        });
    });

    describe('Additional Props', () => {
        it('should pass through additional props to card', () => {
            render(<SkeletonCard data-testid="test-card" />);
            const card = screen.getByTestId('test-card');
            expect(card).toBeInTheDocument();
        });
    });
});
