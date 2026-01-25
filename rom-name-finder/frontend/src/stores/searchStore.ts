import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Game, SearchState } from '@/types/schemas';
import { getGameSearchService } from '@/services/gameSearchService';
import { ERR_SEARCH_TERM_EMPTY, ERR_UNKNOWN } from '@/utils/strings.constant';

// Memoization cache for search term sanitization
const searchTermCache = new Map<string, string[]>();
const MAX_CACHE_SIZE = 100;

interface SearchStore extends SearchState {
    setSearchTerms: (terms: string[]) => void;
    setSelectedDb: (db: string) => void;
    search: (term: string, db: string, includeClones: boolean) => Promise<void>;
    clearResults: () => void;
    setError: (error: string | null) => void;
    setLoading: (isLoading: boolean) => void;
    setViewMode: (mode: string) => void;
    setIncludeClones: (includeClones: boolean) => void;
}

// Function to sanitize search terms with memoization
const sanitizeSearchTerms = (term: string): string[] => {
    // Create a cache key from the input term
    const cacheKey = term;

    // Check if we have a cached result
    if (searchTermCache.has(cacheKey)) {
        return searchTermCache.get(cacheKey)!;
    }

    // Sanitize and discard duplicated items
    const terms = Array.from(new Set(
        term.split('\n')
            .map((term) => {
                return term
                    .toLowerCase()
                    .replace(/[^\w]/g, ' ')
                    .replace(/\s+/g, ' ')
                    .trim();
            })
            .filter(Boolean)
    ));

    // Add to cache
    searchTermCache.set(cacheKey, terms);

    // Limit cache size to prevent memory issues
    if (searchTermCache.size > MAX_CACHE_SIZE) {
        // Remove the oldest entry (first entry in the map)
        const firstKey = searchTermCache.keys().next().value;
        if (firstKey !== undefined) {
            searchTermCache.delete(firstKey);
        }
    }

    return terms;
};

const isDevelopment = import.meta.env.DEV;

export const useSearchStore = create<SearchStore>()(
    devtools(
        persist(
            (set, get) => ({
                searchTerms: [],
                results: null,
                selectedDB: '',
                isLoading: false,
                error: null,
                viewMode: 'simple',
                includeClones: true,
                executionTime: 0,

                setSearchTerms: (terms: string[]) => {
                    set({ searchTerms: terms });
                },

                setSelectedDb: (db: string) => {
                    set({ selectedDB: db });
                },

                search: async (term: string, db: string, includeClones: boolean) => {
                    if (!term.trim()) {
                        set({ error: ERR_SEARCH_TERM_EMPTY, results: null });
                        return;
                    }

                    // Sanitize and discard duplicated items
                    const terms = sanitizeSearchTerms(term);

                    set({
                        isLoading: true,
                        error: null,
                        searchTerms: terms,
                        includeClones
                    });

                    if (!terms.length) {
                        set({ error: ERR_SEARCH_TERM_EMPTY, results: null });
                        return;
                    }

                    try {
                        const service = getGameSearchService();

                        // Load the database if not already loaded
                        if (!service.isLoaded()) {
                            await service.loadDatabase(db);
                        }
                        // If we're switching to a different database, reload it
                        else if (service.isLoaded() && db !== get().selectedDB) {
                            service.terminate();
                            await service.loadDatabase(db);
                        }
                        set({ selectedDB: db });

                        // Calculate the time the next statement takes
                        const startTime = performance.now();
                        let data: Game[];
                        if (terms.length === 1) {
                            data = await service.findOne(terms[0], includeClones);
                        } else {
                            data = await service.findMany(terms, includeClones);
                        }
                        const endTime = performance.now();
                        set({
                            results: data,
                            isLoading: false,
                            executionTime: endTime - startTime
                        });
                    } catch (error) {
                        const errorMessage = error instanceof Error ? error.message : ERR_UNKNOWN;
                        set({ error: errorMessage, results: null, isLoading: false });
                    }
                },

                clearResults: () => {
                    set({ results: null, error: null, searchTerms: [] });
                },

                setError: (error: string | null) => {
                    set({ error });
                },

                setLoading: (isLoading: boolean) => {
                    set({ isLoading });
                },

                setViewMode: (viewMode: string) => {
                    set({ viewMode });
                },

                setIncludeClones: (includeClones: boolean) => {
                    set({ includeClones });
                },
            }),
            {
                name: 'search-store',
                partialize: (state) => ({
                    selectedDB: state.selectedDB,
                    viewMode: state.viewMode,
                    includeClones: state.includeClones,
                }),
            }
        ),
        { name: 'search-store', enabled: isDevelopment }
    )
);

// Selectors for optimized re-renders
export const selectSearchTerm = (state: SearchStore) => state.searchTerms;
export const selectResults = (state: SearchStore) => state.results;
export const selectResultCount = (state: SearchStore) => state.results?.length ?? 0;
export const selectSelectedDB = (state: SearchStore) => state.selectedDB;
export const selectIsLoading = (state: SearchStore) => state.isLoading;
export const selectError = (state: SearchStore) => state.error;
export const selectViewMode = (state: SearchStore) => state.viewMode;
export const selectIncludeClones = (state: SearchStore) => state.includeClones;
export const selectExecutionTime = (state: SearchStore) => state.executionTime;
