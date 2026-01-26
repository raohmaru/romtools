import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchForm } from './SearchForm';
import type { SelectOption } from '@/components/ui/Select/Select';
import { ERR_SEARCH_TERM_EMPTY, ERR_SEARCH_TERM_SHORT, ERR_DB_SELECT } from '../../../utils/constants';
import type { SearchFormData } from '../../../types/schemas';

describe('SearchForm', () => {
    const mockOnSearch = vi.fn((formData: SearchFormData) => {
        return Promise.resolve({ formData });
    });
    const mockDatabaseOptions: SelectOption[] = [
        { value: 'mame2003', label: 'MAME 2003 Plus' },
        { value: 'mame2010', label: 'MAME 2010' },
        { value: 'mame2015', label: 'MAME 2015' },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render form with all fields', () => {
            render(
                <SearchForm
                    onSearch={mockOnSearch}
                    databaseOptions={mockDatabaseOptions}
                />
            );

            expect(screen.getByLabelText('Arcade Game Names*', { exact: false })).toBeInTheDocument();
            expect(screen.getByLabelText('ROM set*', { exact: false })).toBeInTheDocument();
            expect(screen.getByLabelText('Include clones')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
        });

        it('should render with default search term', () => {
            render(
                <SearchForm
                    onSearch={mockOnSearch}
                    databaseOptions={mockDatabaseOptions}
                    defaultSearchTerm="Pacman"
                />
            );

            const textarea = screen.getByLabelText('Arcade Game Names*', { exact: false });
            expect(textarea).toHaveValue('Pacman');
        });

        it('should render with default database', () => {
            render(
                <SearchForm
                    onSearch={mockOnSearch}
                    databaseOptions={mockDatabaseOptions}
                    defaultDatabase="mame2010"
                />
            );

            const select = screen.getByLabelText('ROM set*', { exact: false });
            expect(select).toHaveValue('mame2010');
        });

        it('should render with default include clones checked', () => {
            render(
                <SearchForm
                    onSearch={mockOnSearch}
                    databaseOptions={mockDatabaseOptions}
                    defaultIncludeClones={true}
                />
            );

            const checkbox = screen.getByLabelText('Include clones');
            expect(checkbox).toBeChecked();
        });

        it('should render with default include clones unchecked', () => {
            render(
                <SearchForm
                    onSearch={mockOnSearch}
                    databaseOptions={mockDatabaseOptions}
                    defaultIncludeClones={false}
                />
            );

            const checkbox = screen.getByLabelText('Include clones');
            expect(checkbox).not.toBeChecked();
        });

        it('should render database options', () => {
            render(
                <SearchForm
                    onSearch={mockOnSearch}
                    databaseOptions={mockDatabaseOptions}
                />
            );

            expect(screen.getByText('MAME 2003 Plus')).toBeInTheDocument();
            expect(screen.getByText('MAME 2010')).toBeInTheDocument();
            expect(screen.getByText('MAME 2015')).toBeInTheDocument();
        });

        it('should render help text', () => {
            render(
                <SearchForm
                    onSearch={mockOnSearch}
                    databaseOptions={mockDatabaseOptions}
                />
            );

            expect(screen.getByText(/You can enter multiple terms separated by new lines/)).toBeInTheDocument();
            expect(screen.getByText(/CTRL/)).toBeInTheDocument();
            expect(screen.getByText(/ENTER/)).toBeInTheDocument();
        });
    });

    describe('Form Validation', () => {
        it('should show required indicator for required fields', () => {
            render(
                <SearchForm
                    onSearch={mockOnSearch}
                    databaseOptions={mockDatabaseOptions}
                />
            );

            expect(screen.getByLabelText('Arcade Game Names*')).toBeInTheDocument();
            expect(screen.getByLabelText('ROM set*')).toBeInTheDocument();
        });

        it('should show error when search term is empty', async () => {
            render(
                <SearchForm
                    onSearch={mockOnSearch}
                    databaseOptions={mockDatabaseOptions}
                />
            );

            const form = screen.getByRole('form');
            fireEvent.submit(form);

            expect(await screen.findByText(ERR_SEARCH_TERM_EMPTY)).toBeInTheDocument();
        });

        it('should show error when search term is too short', async () => {
            render(
                <SearchForm
                    onSearch={mockOnSearch}
                    databaseOptions={mockDatabaseOptions}
                />
            );

            const textarea = screen.getByLabelText('Arcade Game Names*');
            // Type into an input element
            const user = userEvent.setup();
            await user.type(textarea, 'ab')
            expect(textarea).toHaveValue('ab')

            const form = screen.getByRole('form');
            fireEvent.submit(form);

            expect(await screen.findByText(ERR_SEARCH_TERM_SHORT)).toBeInTheDocument();
        });

        it('should show error when database is not selected', async () => {
            render(
                <SearchForm
                    onSearch={mockOnSearch}
                    databaseOptions={mockDatabaseOptions}
                />
            );

            const form = screen.getByRole('form');
            fireEvent.submit(form);

            expect(await screen.findByText(ERR_DB_SELECT)).toBeInTheDocument();
        });
    });

    describe('Form Submission', () => {
        it('should call onSearch when form is submitted', async () => {
            const user = userEvent.setup();
            render(
                <SearchForm
                    onSearch={mockOnSearch}
                    databaseOptions={mockDatabaseOptions}
                />
            );

            const textarea = screen.getByLabelText('Arcade Game Names*');
            await user.type(textarea, 'Pacman');
            expect(textarea).toHaveValue('Pacman');

            const select = screen.getByLabelText('ROM set*');
            await user.selectOptions(select, 'mame2003');
            expect(select).toHaveValue('mame2003');

            const form = screen.getByRole('form');
            fireEvent.submit(form);

            await waitFor(() => {
                expect(mockOnSearch).toHaveBeenCalled();
                expect(mockOnSearch).toBeCalledWith({
                    database: 'mame2003',
                    includeClones: true,
                    searchTerm: 'Pacman'
                });
            });
        });

        it('should submit with Ctrl+Enter in textarea', async () => {
            const user = userEvent.setup();
            render(
                <SearchForm
                    onSearch={mockOnSearch}
                    databaseOptions={mockDatabaseOptions}
                />
            );

            const select = screen.getByLabelText('ROM set*');
            await user.selectOptions(select, 'mame2003');
            expect(select).toHaveValue('mame2003');

            const textarea = screen.getByLabelText('Arcade Game Names*');
            await user.type(textarea, 'Pacman');
            textarea.focus();
            await user.keyboard('{Control>}{Enter}{/Control}');

            expect(mockOnSearch).toHaveBeenCalled();
        });
    });

    describe('Loading State', () => {
        it('should disable form when loading', () => {
            render(
                <SearchForm
                    onSearch={mockOnSearch}
                    databaseOptions={mockDatabaseOptions}
                    isLoading
                />
            );

            const textarea = screen.getByLabelText('Arcade Game Names*');
            const select = screen.getByLabelText('ROM set*');
            const button = screen.getByRole('button', { name: 'Searching...' });

            expect(textarea).toBeDisabled();
            expect(select).toBeDisabled();
            expect(button).toBeDisabled();
        });

        it('should show loading text on button when loading', () => {
            render(
                <SearchForm
                    onSearch={mockOnSearch}
                    databaseOptions={mockDatabaseOptions}
                    isLoading
                />
            );

            const button = screen.getByRole('button', { name: 'Searching...' });
            expect(button).toHaveTextContent('Searching...');
        });

        it('should have aria-busy on button when loading', () => {
            render(
                <SearchForm
                    onSearch={mockOnSearch}
                    databaseOptions={mockDatabaseOptions}
                    isLoading
                />
            );

            const button = screen.getByRole('button', { name: 'Searching...' });
            expect(button).toHaveAttribute('aria-busy', 'true');
        });
    });

    describe('User Interactions', () => {
        it('should allow typing in textarea', async () => {
            const user = userEvent.setup();
            render(
                <SearchForm
                    onSearch={mockOnSearch}
                    databaseOptions={mockDatabaseOptions}
                />
            );

            const textarea = screen.getByLabelText('Arcade Game Names*');
            await user.type(textarea, 'Pacman');

            expect(textarea).toHaveValue('Pacman');
        });

        it('should allow selecting database option', async () => {
            const user = userEvent.setup();
            render(
                <SearchForm
                    onSearch={mockOnSearch}
                    databaseOptions={mockDatabaseOptions}
                />
            );

            const select = screen.getByLabelText('ROM set*');
            await user.selectOptions(select, 'mame2010');

            expect(select).toHaveValue('mame2010');
        });

        it('should allow toggling include clones checkbox', async () => {
            const user = userEvent.setup();
            render(
                <SearchForm
                    onSearch={mockOnSearch}
                    databaseOptions={mockDatabaseOptions}
                    defaultIncludeClones={false}
                />
            );

            const checkbox = screen.getByLabelText('Include clones');
            expect(checkbox).not.toBeChecked();
            await user.click(checkbox);
            expect(checkbox).toBeChecked();
        });

        it('should allow entering multiple lines in textarea', async () => {
            const user = userEvent.setup();
            render(
                <SearchForm
                    onSearch={mockOnSearch}
                    databaseOptions={mockDatabaseOptions}
                />
            );

            const textarea = screen.getByLabelText('Arcade Game Names*');
            await user.type(textarea, 'Pacman{Enter}Space Invaders{Enter}Donkey Kong');

            expect(textarea).toHaveValue('Pacman\nSpace Invaders\nDonkey Kong');
        });
    });

    describe('Accessibility', () => {
        it('should have proper form label', () => {
            render(
                <SearchForm
                    onSearch={mockOnSearch}
                    databaseOptions={mockDatabaseOptions}
                />
            );

            const form = screen.getByRole('form', { name: 'Search form' });
            expect(form).toBeInTheDocument();
        });

        it('should have proper labels for all inputs', () => {
            render(
                <SearchForm
                    onSearch={mockOnSearch}
                    databaseOptions={mockDatabaseOptions}
                />
            );

            expect(screen.getByLabelText('Arcade Game Names*')).toBeInTheDocument();
            expect(screen.getByLabelText('ROM set*')).toBeInTheDocument();
            expect(screen.getByLabelText('Include clones')).toBeInTheDocument();
        });

        it('should have aria-describedby for help text', () => {
            render(
                <SearchForm
                    onSearch={mockOnSearch}
                    databaseOptions={mockDatabaseOptions}
                />
            );

            const textarea = screen.getByLabelText('Arcade Game Names*');
            expect(textarea).toHaveAttribute('aria-describedby', 'search-terms-help');
        });

        it('should have help text with id', () => {
            render(
                <SearchForm
                    onSearch={mockOnSearch}
                    databaseOptions={mockDatabaseOptions}
                />
            );

            const helpText = screen.getByText(/You can enter multiple terms/);
            expect(helpText).toHaveAttribute('id', 'search-terms-help');
        });

        it('should be keyboard navigable', () => {
            render(
                <SearchForm
                    onSearch={mockOnSearch}
                    databaseOptions={mockDatabaseOptions}
                />
            );

            const textarea = screen.getByLabelText('Arcade Game Names*');
            const select = screen.getByLabelText('ROM set*');
            const checkbox = screen.getByLabelText('Include clones');
            const button = screen.getByRole('button', { name: 'Search' });

            expect(textarea.tagName).toBe('TEXTAREA');
            expect(select.tagName).toBe('SELECT');
            expect(checkbox.tagName).toBe('INPUT');
            expect(button.tagName).toBe('BUTTON');
        });
    });

    describe('Edge Cases', () => {
        it('should render with empty database options', () => {
            render(
                <SearchForm
                    onSearch={mockOnSearch}
                    databaseOptions={[]}
                />
            );

            expect(screen.getByLabelText('ROM set*')).toBeInTheDocument();
        });

        it('should render with single database option', () => {
            const singleOption: SelectOption[] = [
                { value: 'mame2003', label: 'MAME 2003 Plus' },
            ];
            render(
                <SearchForm
                    onSearch={mockOnSearch}
                    databaseOptions={singleOption}
                />
            );

            expect(screen.getByText('MAME 2003 Plus')).toBeInTheDocument();
        });
    });
});
