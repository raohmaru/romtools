import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SearchForm } from '@/components/features/SearchForm/SearchForm';
import { type SearchFormData } from '@/types/schemas';
import { SearchResults } from '@/components/features/SearchResults/SearchResults';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary/ErrorBoundary';
import {
    useSearchStore, selectIsLoading, selectError, selectResults, selectSelectedDB, selectResultCount, selectIncludeClones, selectExecutionTime
} from '@/stores/searchStore';
import { getGameSearchService } from '@/services/gameSearchService';
import { LoadingSpinner } from './components/ui/LoadingSpinner/LoadingSpinner';
import { Overlay } from './components/ui/Overlay/Overlay';
import { Headline } from './components/ui/Headline/Headline';
import './App.css';
import { useDeviceDetails } from './hooks/useDeviceDetails';
import { ScrollToTop } from './components/features/ScrollToTop/ScrollToTop';
import { useThrottle } from './utils/throttle';

function SearchApp() {
    const { search, setError, clearResults } = useSearchStore();
    const isLoading = useSearchStore(selectIsLoading);
    const error = useSearchStore(selectError);
    const results = useSearchStore(selectResults);
    const resultCount = useSearchStore(selectResultCount);
    const selectedDB = useSearchStore(selectSelectedDB);
    const includeClones = useSearchStore(selectIncludeClones);
    const executionTime = useSearchStore(selectExecutionTime);
    const [loadingDatabase, setLoadingDatabase] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const resultsNode = useRef<HTMLElement>(null);
    const { touchSupport } = useDeviceDetails();

    // Get select database options from .env
    const databaseOptions = useMemo(() =>
        JSON.parse(import.meta.env.VITE_DBS).map((db: string) => {
            return {
                value: db,
                label: db.replaceAll('_', ' ')
            };
        }),
    []);

    // Initialize database on mount
    useEffect(() => {
        const initDatabase = async () => {
            try {
                const service = getGameSearchService();
                if (!service.isLoaded() && selectedDB) {
                    setLoadingDatabase(true);
                    await service.loadDatabase(selectedDB);
                    setLoadingDatabase(false);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to initialize database');
                setLoadingDatabase(false);
            }
        };

        initDatabase();
    }, [setError, selectedDB]);

    // Create debounced search function
    const throttle = useThrottle(300);
    const handleSearch = useCallback((formData: SearchFormData) => {
        throttle((data) => {
            const typedData = data as SearchFormData;
            clearResults();
            const { searchTerm, database, includeClones } = typedData;
            search(searchTerm, database, includeClones);
            setShowResults(true);
        }, [formData]);
    }, [throttle, clearResults, search]);

    useEffect(() => {
        if (touchSupport) {
            if (results?.length) {
                setTimeout(() => {
                    resultsNode.current?.scrollIntoView({ behavior: 'smooth' });
                }, 10);
            }
        }
    }, [touchSupport, results]);

    useEffect(() => {
        // 1. Enables drag and drop in FF
        // 2. Prevent default drag-and-drop behavior on the entire window
        document.addEventListener('dragover', (e: DragEvent) => {
            e.preventDefault();
            e.dataTransfer!.dropEffect = 'none';
        }, true);
    }, []);

    // Transform results to SearchResults format
    const searchResults = useMemo(() =>
        results?.map((game) => ({
            title: game.name,
            metadata: {
                ROM: game.rom,
                cloneOf: game.cloneOf,
            },
        })) ?? [],
    [results]);

    return (
        <main id="main-content" className="app-container">
            <header className="app-header">
                <div>
                    <Headline>
                        {import.meta.env.VITE_APP_NAME}
                    </Headline>
                    <p className="app-description">
                        Find the MAME ROM name of arcade games
                    </p>
                </div>
            </header>

            <section aria-label="Search">
                <SearchForm
                    onSearch={handleSearch}
                    databaseOptions={databaseOptions}
                    isLoading={isLoading}
                    defaultSearchTerm=""
                    defaultDatabase={selectedDB}
                    defaultIncludeClones={includeClones}
                />
            </section>

            {showResults && (
                <section aria-label="Results" className="results-section" ref={resultsNode}>
                    <SearchResults
                        results={searchResults}
                        isLoading={isLoading}
                        error={error || undefined}
                        totalCount={resultCount}
                        executionTime={executionTime}
                        includeClones={includeClones}
                    />
                </section>
            )}

            <ScrollToTop />

            <Overlay
                visible={loadingDatabase}>
                <LoadingSpinner
                    size='large'
                />
            </Overlay>
        </main>
    );
}

function App() {
    return (
        <>
            <a href="#main-content" className="skip-link">Skip to main content</a>
            <ErrorBoundary
                fallback={
                    <div className="error-fallback" role="alert">
                        <h2>Something went wrong</h2>
                        <p>An unexpected error occurred. Please try refreshing the page.</p>
                    </div>
                }
            >
                <SearchApp />
            </ErrorBoundary>
        </>
    );
}

export default App;
