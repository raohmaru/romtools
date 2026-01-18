import { useCallback } from 'react';
import { selectViewMode, useSearchStore } from '@/stores/searchStore';
import { ErrorMessage } from '@/components/ui/ErrorMessage/ErrorMessage';
import { SkeletonCard } from '@/components/ui/Skeleton/Skeleton';
import { Toolbar } from '@/components/features/Toolbar/Toolbar';
import { SimpleResults } from './SimpleResults';
import { DetailedResults } from './DetailedResults';
import styles from './SearchResults.module.css';

export interface SearchResult {
    /**
     * Title or name of the ROM
     */
    title: string;
    /**
     * Additional metadata about the ROM
     */
    metadata?: Record<string, string | number | boolean | null | undefined>;
}

export interface SearchResultsProps {
    /**
     * Array of search results to display
     */
    results: SearchResult[];
    /**
     * Whether results are currently loading
     */
    isLoading: boolean;
    /**
     * Error message to display if search failed
     */
    error?: string;
    /**
     * Number of results found
     */
    totalCount?: number;
    /**
     * Search execution time in ms
     */
    executionTime?: number;
    /**
     * Show clones
     */
    includeClones?: boolean;
}

export const SearchResults = ({
    results,
    isLoading,
    error,
    totalCount,
    executionTime,
    includeClones,
}: SearchResultsProps) => {
    const viewMode = useSearchStore(selectViewMode);

    // Copy results to the clipboard
    const onCopy = useCallback(() => {
        let str = '';
        results.map((result: SearchResult) => {
            str += `${result.metadata?.ROM}\n`;
        });
        navigator.clipboard.writeText(str);
    }, [results]);

    // Export results as CSV file
    const onExport = useCallback(() => {
        // Create CSV content with header
        let str = 'ROM,Title\n';
        results.map((result: SearchResult) => {
            str += `${result.metadata?.ROM},"${result.title}"\n`;
        });
        // Create a Blob with the CSV content
        const blob = new Blob([str], { type: 'text/csv;charset=utf-8;' });
        // Create a download link
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'rom-search-results.csv');
        link.style.visibility = 'hidden';
        // Append to DOM, trigger download, and clean up
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        // Clean up the URL object
        URL.revokeObjectURL(url);
    }, [results]);

    if (isLoading) {
        return (
            <div className={styles.container} role="status" aria-live="polite">
                <p className={styles['loading-label']}>Searching...</p>
                <div className={styles['skeleton-list']}>
                    {Array.from({ length: 2 }).map((_, index) => (
                        <SkeletonCard key={index} />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <ErrorMessage message={error} />
            </div>
        );
    }

    if (results.length === 0) {
        return (
            <div className={styles.container} role="status" aria-live="polite">
                <div className={styles['empty-state']}>
                    <span className={styles['empty-icon']} aria-hidden="true">
                        <img src="/img/empty.svg" alt="No results" width={100} />
                    </span>
                    <p className={styles['empty-message']}>
                        No games found
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container} role="region" aria-label="Search results">
            <div className={styles.toolbar} role="toolbar">
                <p className={styles.status} role="status">
                    Found {totalCount} game{totalCount !== 1 ? 's' : ''} in {executionTime?.toFixed(2)}ms
                </p>

                <Toolbar
                    onCopy={onCopy}
                    onExport={onExport}
                />
            </div>

            {viewMode === 'detailed' ? (
                <DetailedResults
                    results={results}
                />
            ) : (
                <SimpleResults
                    results={results}
                    includeClones={includeClones}
                />
            )}
        </div>
    );
}
