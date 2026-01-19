import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button/Button';
import { Textarea } from '@/components/ui/Textarea/Textarea';
import { Select, type SelectOption } from '@/components/ui/Select/Select';
import { searchFormSchema, type SearchFormData } from '@/types/schemas';
import styles from './SearchForm.module.css';
import { Checkbox } from '../../ui/Checkbox/Checkbox';
import { useDeviceDetails } from '../../../hooks/useDeviceDetails';

export interface SearchFormProps {
    /**
     * Callback when search is submitted
     */
    onSearch: (data: SearchFormData) => void;
    /**
     * Available database options
     */
    databaseOptions: SelectOption[];
    /**
     * Whether the search is currently loading
     */
    isLoading?: boolean;
    /**
     * Default value for search term
     */
    defaultSearchTerm?: string;
    /**
     * Default value for database selection
     */
    defaultDatabase?: string;
    /**
     * Default value for include clones
     */
    defaultIncludeClones?: boolean;
}

export const SearchForm = ({
    onSearch,
    databaseOptions,
    isLoading = false,
    defaultSearchTerm = '',
    defaultDatabase = '',
    defaultIncludeClones = true,
}: SearchFormProps) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SearchFormData>({
        resolver: zodResolver(searchFormSchema),
        defaultValues: {
            searchTerm: defaultSearchTerm,
            database: defaultDatabase,
            includeClones: defaultIncludeClones
        },
    });

    const onSubmit = async (formData: SearchFormData) => {
        onSearch(formData);
    }

    let placeholder = 'Enter arcade game names (one per line).';
    const { touchSupport } = useDeviceDetails();
    if (!touchSupport) {
        placeholder = placeholder.substring(0, placeholder.length - 1) + ' or drop here a file with arcade game names separated by new lines.';
    }

    return (
        <form
            className={styles.form}
            onSubmit={handleSubmit(onSubmit)}
            aria-label="Search form"
        >
            <Textarea
                {...register('searchTerm')}
                label="Arcade Game Names"
                hideLabel={true}
                name="searchTerm"
                placeholder={placeholder}
                required
                autoFocus={true}
                error={errors.searchTerm?.message}
                className={styles.textarea}
                aria-describedby="search-terms-help"
                disabled={isLoading}
                onSubmit={handleSubmit(onSearch)}
            />
            <p
                className="size-sm"
                id="search-terms-help"
            >
                You can enter multiple terms separated by new lines, or you can drop a file.<br />
                <span className="hide-touch">Pres <code>CTRL</code> + <code>ENTER</code> or click the "Search" button to search.</span>
            </p>

            <Select
                {...register('database')}
                label="ROM set"
                labelTitle="ROM sets are collections of games (ROMs) that require a specific MAME version for proper function"
                name="database"
                options={databaseOptions}
                placeholder="Select a ROMset"
                required
                error={errors.database?.message}
                className={styles.select}
                disabled={isLoading}
            />

            <Checkbox
                {...register('includeClones')}
                name="includeClones"
                label="Include clones"
                labelTitle="Clones are different versions (regional, hacked, bootleg, revised) of the same base game (or 'parent' ROM)"
            />

            <Button
                type="submit"
                className={styles.button}
                disabled={isLoading}
                aria-busy={isLoading}
            >
                {isLoading ? 'Searching...' : 'Search'}
            </Button>
        </form>
    );
}
