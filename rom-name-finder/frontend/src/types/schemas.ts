import { z } from 'zod';
import { ERR_SEARCH_TERM_EMPTY, ERR_SEARCH_TERM_SHORT, ERR_DB_SELECT, MAX_FILE_SIZE } from '../utils/constants';

export interface Game {
    rom: string;
    name: string;
    cloneOf?: string;
}

export interface SearchState {
    searchTerms: string[];
    results: Game[] | null;
    selectedDB: string;
    isLoading: boolean;
    error: string | null;
    viewMode: string | 'simple';
    includeClones: boolean;
    executionTime: number;
}

export const searchFormSchema = z.object({
    searchTerm: z.string()
        .nonempty(ERR_SEARCH_TERM_EMPTY)
        .max(MAX_FILE_SIZE, `Search term is too long (maximum ${MAX_FILE_SIZE} characters)`)
        // Custom validation
        .refine((value) => {
            const valid = value
                .split('\n')
                .map((v) => v.trim())
                .filter(Boolean)
                .every((v) => v.length >= 3);
            return valid;
        }, {
            message: ERR_SEARCH_TERM_SHORT
        }),
    database: z.string().min(1, ERR_DB_SELECT),
    includeClones: z.boolean(),
});

export type SearchFormData = z.infer<typeof searchFormSchema>;

export type ViewMode = 'simple' | 'detailed';
