import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSearchStore } from './searchStore';
import { ERR_SEARCH_TERM_EMPTY, ERR_UNKNOWN } from '@/utils/constants';
import type { Game } from '@/types/schemas';

// Mock getGameSearchService
const mockFindOne = vi.fn();
const mockFindMany = vi.fn();
const mockIsLoaded = vi.fn(() => false);
const mockLoadDatabase = vi.fn(() => Promise.resolve());
const mockTerminate = vi.fn();

vi.mock('@/services/gameSearchService', () => ({
    getGameSearchService: vi.fn(() => ({
        isLoaded: mockIsLoaded,
        loadDatabase: mockLoadDatabase,
        terminate: mockTerminate,
        findOne: mockFindOne,
        findMany: mockFindMany,
    })),
}));

// Mock performance.now
const mockPerformanceNow = vi.fn();
global.performance = {
    ...global.performance,
    now: mockPerformanceNow,
};

describe('useSearchStore', () => {
    beforeEach(() => {
        useSearchStore.setState({
            searchTerms: [],
            results: null,
            selectedDB: '',
            isLoading: false,
            error: null,
            viewMode: 'detailed',
            includeClones: true,
            executionTime: 0,
        });
        vi.clearAllMocks();
        mockIsLoaded.mockReturnValue(false); // Reset mock implementation
        mockLoadDatabase.mockResolvedValue(undefined); // Reset mock implementation
        mockFindOne.mockResolvedValue([]);
        mockFindMany.mockResolvedValue([]);
    });

    it('should return initial state', () => {
        const state = useSearchStore.getState();
        expect(state.searchTerms).toEqual([]);
        expect(state.results).toBeNull();
        expect(state.selectedDB).toBe('');
        expect(state.isLoading).toBe(false);
        expect(state.error).toBeNull();
        expect(state.viewMode).toBe('detailed');
        expect(state.includeClones).toBe(true);
        expect(state.executionTime).toBe(0);
    });

    it('should set search terms', () => {
        const { setSearchTerms } = useSearchStore.getState();
        setSearchTerms(['term1', 'term2']);
        expect(useSearchStore.getState().searchTerms).toEqual(['term1', 'term2']);
    });

    it('should set selected database', () => {
        const { setSelectedDb } = useSearchStore.getState();
        setSelectedDb('MAME 2003 plus');
        expect(useSearchStore.getState().selectedDB).toBe('MAME 2003 plus');
    });

    it('should set loading state', () => {
        const { setLoading } = useSearchStore.getState();
        setLoading(true);
        expect(useSearchStore.getState().isLoading).toBe(true);
        setLoading(false);
        expect(useSearchStore.getState().isLoading).toBe(false);
    });

    it('should set error', () => {
        const { setError } = useSearchStore.getState();
        setError('Test Error');
        expect(useSearchStore.getState().error).toBe('Test Error');
        setError(null);
        expect(useSearchStore.getState().error).toBeNull();
    });

    it('should set view mode', () => {
        const { setViewMode } = useSearchStore.getState();
        setViewMode('simple');
        expect(useSearchStore.getState().viewMode).toBe('simple');
    });

    it('should set include clones', () => {
        const { setIncludeClones } = useSearchStore.getState();
        setIncludeClones(false);
        expect(useSearchStore.getState().includeClones).toBe(false);
        setIncludeClones(true);
        expect(useSearchStore.getState().includeClones).toBe(true);
    });

    it('should clear results', () => {
        useSearchStore.setState({ results: [{ rom: '1', name: 'Game 1' }] as Game[], error: 'error', searchTerms: ['test'] });
        const { clearResults } = useSearchStore.getState();
        clearResults();
        expect(useSearchStore.getState().results).toBeNull();
        expect(useSearchStore.getState().error).toBeNull();
        expect(useSearchStore.getState().searchTerms).toEqual([]);
    });

    describe('search', () => {
        it('should not search if term is empty', async () => {
            const { search } = useSearchStore.getState();
            await search('', 'db', true);
            expect(useSearchStore.getState().error).toBe(ERR_SEARCH_TERM_EMPTY);
            expect(useSearchStore.getState().results).toBeNull();
            expect(useSearchStore.getState().isLoading).toBe(false);
            expect(mockLoadDatabase).not.toHaveBeenCalled();
            expect(mockFindOne).not.toHaveBeenCalled();
            expect(mockFindMany).not.toHaveBeenCalled();
        });

        it('should sanitize search terms and remove duplicates', async () => {
            const { search } = useSearchStore.getState();
            mockPerformanceNow.mockReturnValueOnce(0).mockReturnValueOnce(100);

            await search(`  Term1
 term1
 Term2!`, 'db', true);

            expect(useSearchStore.getState().searchTerms).toEqual(['term1', 'term2']);
            expect(mockFindMany).toHaveBeenCalledWith(['term1', 'term2'], true);
            expect(useSearchStore.getState().isLoading).toBe(false);
            expect(useSearchStore.getState().error).toBeNull();
            expect(useSearchStore.getState().executionTime).toBe(100);
        });

        it('should load database if not already loaded', async () => {
            const { search } = useSearchStore.getState();
            mockPerformanceNow.mockReturnValueOnce(0).mockReturnValueOnce(100);

            await search('term', 'newDB', true);

            expect(mockIsLoaded).toHaveBeenCalled();
            expect(mockLoadDatabase).toHaveBeenCalledWith('newDB');
            expect(useSearchStore.getState().selectedDB).toBe('newDB');
            expect(useSearchStore.getState().isLoading).toBe(false);
            expect(useSearchStore.getState().executionTime).toBe(100);
        });

        it('should reload database if switching to a different database', async () => {
            useSearchStore.setState({ selectedDB: 'oldDB' });
            mockIsLoaded.mockReturnValue(true);
            const { search } = useSearchStore.getState();
            mockPerformanceNow.mockReturnValueOnce(0).mockReturnValueOnce(100);

            await search('term', 'newDB', true);

            expect(mockIsLoaded).toHaveBeenCalled();
            expect(mockTerminate).toHaveBeenCalled();
            expect(mockLoadDatabase).toHaveBeenCalledWith('newDB');
            expect(useSearchStore.getState().selectedDB).toBe('newDB');
            expect(useSearchStore.getState().isLoading).toBe(false);
            expect(useSearchStore.getState().executionTime).toBe(100);
        });

        it('should call findOne for a single search term', async () => {
            const { search } = useSearchStore.getState();
            const mockGame: Game = { rom: 'g1', name: 'Game 1' };
            mockFindOne.mockResolvedValueOnce([mockGame]);
            mockPerformanceNow.mockReturnValueOnce(0).mockReturnValueOnce(50);

            await search('single term', 'db', false);

            expect(useSearchStore.getState().isLoading).toBe(false);
            expect(useSearchStore.getState().searchTerms).toEqual(['single term']);
            expect(useSearchStore.getState().includeClones).toBe(false);
            expect(mockFindOne).toHaveBeenCalledWith('single term', false);
            expect(mockFindMany).not.toHaveBeenCalled();
            expect(useSearchStore.getState().results).toEqual([mockGame]);
            expect(useSearchStore.getState().executionTime).toBe(50);
        });

        it('should call findMany for multiple search terms', async () => {
            const { search } = useSearchStore.getState();
            const mockGames: Game[] = [{ rom: 'g1', name: 'Game 1' }, { rom: 'g2', name: 'Game 2' }];
            mockFindMany.mockResolvedValueOnce(mockGames);
            mockPerformanceNow.mockReturnValueOnce(0).mockReturnValueOnce(150);

            await search(`term1\nterm2`, 'db', true);

            expect(useSearchStore.getState().isLoading).toBe(false);
            expect(useSearchStore.getState().searchTerms).toEqual(['term1', 'term2']);
            expect(useSearchStore.getState().includeClones).toBe(true);
            expect(mockFindOne).not.toHaveBeenCalled();
            expect(mockFindMany).toHaveBeenCalledWith(['term1', 'term2'], true);
            expect(useSearchStore.getState().results).toEqual(mockGames);
            expect(useSearchStore.getState().executionTime).toBe(150);
        });

        it('should handle search errors', async () => {
            const { search } = useSearchStore.getState();
            const errorMessage = 'Search failed';
            mockFindOne.mockRejectedValueOnce(new Error(errorMessage));

            await search('term', 'db', true);

            expect(useSearchStore.getState().error).toBe(errorMessage);
            expect(useSearchStore.getState().results).toBeNull();
            expect(useSearchStore.getState().isLoading).toBe(false);

            // Test with a non-Error object rejection
            useSearchStore.setState({ error: null }); // Clear error for next test
            mockFindOne.mockRejectedValueOnce('Some unknown error');
            await search('another term', 'db', true);
            expect(useSearchStore.getState().error).toBe(ERR_UNKNOWN);
        });
    });

    describe('selectors', () => {
        it('selectSearchTerm should return search terms', () => {
            useSearchStore.setState({ searchTerms: ['test1', 'test2'] });
            expect(useSearchStore.getState().searchTerms).toEqual(['test1', 'test2']);
        });

        it('selectResults should return results', () => {
            const mockResults: Game[] = [{ rom: 'g1', name: 'Game 1' }];
            useSearchStore.setState({ results: mockResults });
            expect(useSearchStore.getState().results).toEqual(mockResults);
        });

        it('selectResultCount should return correct count', () => {
            // No results
            useSearchStore.setState({ results: null });
            expect(useSearchStore.getState().results?.length ?? 0).toBe(0);

            // With results
            const mockResults: Game[] = [{ rom: 'g1', name: 'Game 1' }, { rom: 'g2', name: 'Game 2' }];
            useSearchStore.setState({ results: mockResults });
            expect(useSearchStore.getState().results?.length ?? 0).toBe(2);
        });

        it('selectSelectedDB should return selected DB', () => {
            useSearchStore.setState({ selectedDB: 'testDB' });
            expect(useSearchStore.getState().selectedDB).toBe('testDB');
        });

        it('selectIsLoading should return isLoading state', () => {
            useSearchStore.setState({ isLoading: true });
            expect(useSearchStore.getState().isLoading).toBe(true);
        });

        it('selectError should return error state', () => {
            useSearchStore.setState({ error: 'Some error' });
            expect(useSearchStore.getState().error).toBe('Some error');
        });

        it('selectViewMode should return view mode', () => {
            useSearchStore.setState({ viewMode: 'simple' });
            expect(useSearchStore.getState().viewMode).toBe('simple');
        });

        it('selectIncludeClones should return include clones state', () => {
            useSearchStore.setState({ includeClones: false });
            expect(useSearchStore.getState().includeClones).toBe(false);
        });

        it('selectExecutionTime should return execution time', () => {
            useSearchStore.setState({ executionTime: 123.45 });
            expect(useSearchStore.getState().executionTime).toBe(123.45);
        });
    });
});
