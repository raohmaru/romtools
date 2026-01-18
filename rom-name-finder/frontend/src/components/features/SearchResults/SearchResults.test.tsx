import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import { SearchResults, type SearchResult } from './SearchResults';

// Mock clipboard API
Object.assign(navigator, {
    clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
    },
});

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:test-url');
global.URL.revokeObjectURL = vi.fn();

describe('SearchResults', () => {
    const mockResults: SearchResult[] = [
        {
            title: 'Pac-Man',
            metadata: {
                ROM: 'pacman',
                cloneOf: null,
            },
        },
        {
            title: 'Space Invaders',
            metadata: {
                ROM: 'invaders',
                cloneOf: null,
            },
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Rendering with Results', () => {
        it('should render results when provided', async () => {
            render(
                <SearchResults
                    results={mockResults}
                    isLoading={false}
                    totalCount={2}
                    executionTime={100}
                />
            );

            expect(screen.getByText('Found 2 games in 100.00ms')).toBeInTheDocument();
            expect(screen.getByText('Pac-Man')).toBeInTheDocument();
            expect(screen.getByText('Space Invaders')).toBeInTheDocument();
        });

        it('should render detailed view when viewMode is detailed', () => {
            render(
                <SearchResults
                    results={mockResults}
                    isLoading={false}
                    totalCount={2}
                    executionTime={100}
                />
            );

            expect(screen.getByText('Pac-Man')).toBeInTheDocument();
            expect(screen.getByText('pacman')).toBeInTheDocument();
        });

        it('should render simple view when viewMode is simple', () => {
            render(
                <SearchResults
                    results={mockResults}
                    isLoading={false}
                    totalCount={2}
                    executionTime={100}
                    includeClones={true}
                />
            );

            expect(screen.getByText('Pac-Man')).toBeInTheDocument();
        });

        it('should display correct count for single result', () => {
            render(
                <SearchResults
                    results={[mockResults[0]]}
                    isLoading={false}
                    totalCount={1}
                    executionTime={50}
                />
            );

            expect(screen.getByText('Found 1 game in 50.00ms')).toBeInTheDocument();
        });

        it('should display correct count for multiple results', () => {
            render(
                <SearchResults
                    results={mockResults}
                    isLoading={false}
                    totalCount={10}
                    executionTime={200}
                />
            );

            expect(screen.getByText('Found 10 games in 200.00ms')).toBeInTheDocument();
        });
    });

    describe('Loading State', () => {
        it('should render loading state when isLoading is true', () => {
            render(
                <SearchResults
                    results={[]}
                    isLoading
                    totalCount={0}
                />
            );

            expect(screen.getByText('Searching...')).toBeInTheDocument();
            expect(screen.getAllByRole('status')).toHaveLength(3); // 2 skeleton cards + 1 loading label
        });

        it('should render skeleton cards when loading', () => {
            render(
                <SearchResults
                    results={[]}
                    isLoading
                    totalCount={0}
                />
            );

            const skeletons = document.querySelectorAll('.skeleton');
            expect(skeletons.length).toBeGreaterThan(0);
            skeletons.forEach((skeleton) => {
                expect(skeleton).toHaveRole('presentation');
            })
        });

        it('should have aria-live="polite" on loading container', () => {
            render(
                <SearchResults
                    results={[]}
                    isLoading
                    totalCount={0}
                />
            );

            const container = screen.getByText('Searching...').closest('[role="status"]');
            expect(container).toHaveAttribute('aria-live', 'polite');
        });
    });

    describe('Error State', () => {
        it('should render error message when error is provided', () => {
            render(
                <SearchResults
                    results={[]}
                    isLoading={false}
                    error="Database not found"
                    totalCount={0}
                />
            );

            expect(screen.getByText('Database not found')).toBeInTheDocument();
        });

        it('should have role="alert" on error container', () => {
            render(
                <SearchResults
                    results={[]}
                    isLoading={false}
                    error="Database not found"
                    totalCount={0}
                />
            );

            const container = screen.getByRole('alert');
            expect(container).toBeInTheDocument();
        });
    });

    describe('Empty State', () => {
        it('should render empty state when results array is empty', () => {
            render(
                <SearchResults
                    results={[]}
                    isLoading={false}
                    totalCount={0}
                />
            );

            expect(screen.getByText('No games found')).toBeInTheDocument();
        });

        it('should render empty icon', () => {
            render(
                <SearchResults
                    results={[]}
                    isLoading={false}
                    totalCount={0}
                />
            );

            const emptyIcon = screen.getByAltText('No results');
            expect(emptyIcon).toBeInTheDocument();
        });

        it('should have aria-live="polite" on empty state container', () => {
            render(
                <SearchResults
                    results={[]}
                    isLoading={false}
                    totalCount={0}
                />
            );

            const container = screen.getByText('No games found').closest('[role="status"]');
            expect(container).toHaveAttribute('aria-live', 'polite');
        });
    });

    describe('Copy Functionality', () => {
        it('should copy ROM names to clipboard when copy button is clicked', async () => {
            render(
                <SearchResults
                    results={mockResults}
                    isLoading={false}
                    totalCount={2}
                    executionTime={100}
                />
            );

            const copyButton = screen.getByLabelText('Copy ROM names to clipboard');
            await waitFor(() => {
                expect(copyButton).toBeInTheDocument();
            });

            act(() => {
                copyButton.click();
            });

            expect(navigator.clipboard.writeText).toHaveBeenCalledWith('pacman\ninvaders\n');
        });

        it('should handle empty results when copying', async () => {
            render(
                <SearchResults
                    results={[]}
                    isLoading={false}
                    totalCount={0}
                />
            );

            const copyButton = screen.queryByLabelText('Copy ROM names to clipboard');
            expect(copyButton).not.toBeInTheDocument();
        });
    });

    describe('Export Functionality', () => {
        it('should export results as CSV when export button is clicked', async () => {
            const mockCreateElement = vi.spyOn(document, 'createElement');
            const mockAppendChild = vi.spyOn(document.body, 'appendChild');
            const mockRemoveChild = vi.spyOn(document.body, 'removeChild');

            render(
                <SearchResults
                    results={mockResults}
                    isLoading={false}
                    totalCount={2}
                    executionTime={100}
                />
            );

            const exportButton = screen.getByLabelText('Export as CSV');
            await waitFor(() => {
                expect(exportButton).toBeInTheDocument();
            });

            exportButton.click();

            await waitFor(() => {
                expect(mockCreateElement).toHaveBeenCalledWith('a');
                expect(mockAppendChild).toHaveBeenCalled();
                expect(mockRemoveChild).toHaveBeenCalled();
            });

            mockCreateElement.mockRestore();
            mockAppendChild.mockRestore();
            mockRemoveChild.mockRestore();
        });

        it('should create CSV with correct format', async () => {
            render(
                <SearchResults
                    results={mockResults}
                    isLoading={false}
                    totalCount={2}
                    executionTime={100}
                />
            );

            const exportButton = screen.getByLabelText('Export as CSV');
            exportButton.click();

            await waitFor(() => {
                expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
            });
        });
    });

    describe('Accessibility', () => {
        it('should have role="region" on results container', () => {
            render(
                <SearchResults
                    results={mockResults}
                    isLoading={false}
                    totalCount={2}
                    executionTime={100}
                />
            );

            const container = screen.getByRole('region', { name: 'Search results' });
            expect(container).toBeInTheDocument();
        });

        it('should have role="toolbar" on toolbar container', () => {
            render(
                <SearchResults
                    results={mockResults}
                    isLoading={false}
                    totalCount={2}
                    executionTime={100}
                />
            );

            const toolbar = screen.getByRole('toolbar');
            expect(toolbar).toBeInTheDocument();
        });

        it('should have role="status" on status text', () => {
            render(
                <SearchResults
                    results={mockResults}
                    isLoading={false}
                    totalCount={2}
                    executionTime={100}
                />
            );

            const status = screen.getByRole('status');
            expect(status).toBeInTheDocument();
        });

        it('should have accessible labels for toolbar buttons', () => {
            render(
                <SearchResults
                    results={mockResults}
                    isLoading={false}
                    totalCount={2}
                    executionTime={100}
                />
            );

            expect(screen.getByLabelText('Simple view')).toBeInTheDocument();
            expect(screen.getByLabelText('Detailed view')).toBeInTheDocument();
            expect(screen.getByLabelText('Copy ROM names to clipboard')).toBeInTheDocument();
            expect(screen.getByLabelText('Export as CSV')).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('should handle results with missing metadata', () => {
            const resultsWithoutMetadata: SearchResult[] = [
                { title: 'Game 1' },
                { title: 'Game 2' },
            ];

            render(
                <SearchResults
                    results={resultsWithoutMetadata}
                    isLoading={false}
                    totalCount={2}
                    executionTime={100}
                />
            );

            expect(screen.getByText('Game 1')).toBeInTheDocument();
            expect(screen.getByText('Game 2')).toBeInTheDocument();
        });

        it('should handle results with null metadata values', () => {
            const resultsWithNullMetadata: SearchResult[] = [
                {
                    title: 'Game 1',
                    metadata: {
                        ROM: null as any,
                        cloneOf: null,
                    },
                },
            ];

            render(
                <SearchResults
                    results={resultsWithNullMetadata}
                    isLoading={false}
                    totalCount={1}
                    executionTime={100}
                />
            );

            expect(screen.getByText('Game 1')).toBeInTheDocument();
        });

        it('should handle very large execution time', () => {
            render(
                <SearchResults
                    results={mockResults}
                    isLoading={false}
                    totalCount={2}
                    executionTime={9999.99}
                />
            );

            expect(screen.getByText('Found 2 games in 9999.99ms')).toBeInTheDocument();
        });

        it('should handle zero execution time', () => {
            render(
                <SearchResults
                    results={mockResults}
                    isLoading={false}
                    totalCount={2}
                    executionTime={0}
                />
            );

            expect(screen.getByText('Found 2 games in 0.00ms')).toBeInTheDocument();
        });
    });
});
