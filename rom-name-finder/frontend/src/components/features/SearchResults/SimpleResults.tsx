import styles from './SearchResults.module.css';
import { ExternalLink } from './ExternalLink';
import type { SearchResult } from './SearchResults';
import { decode } from 'html-entities';

export interface SearchResultViewPros {
    results: SearchResult[];
    includeClones?: boolean;
}

// Simple view component
export const SimpleResults = ({ results, includeClones }: SearchResultViewPros) => {
    return (
        <table className={styles['simple-table']} aria-label="MAME ROMs names result table">
            <thead>
                <tr>
                    <th scope="col">ROM</th>
                    <th scope="col">Name</th>
                    {includeClones && (
                        <th scope="col">Clone of</th>
                    )}
                </tr>
            </thead>
            <tbody>
                {results.map((result, index) => (
                    <tr key={index}>
                        <td scope='row'>
                            <strong>
                                <ExternalLink
                                    type='adb'
                                    result={result}
                                    className={styles['external-link']}
                                >
                                    {result.metadata?.ROM}
                                </ExternalLink>
                            </strong>
                        </td>
                        <td>
                            <ExternalLink
                                type='moby'
                                result={result}
                                className={styles['external-link']}
                            >
                                {decode(result.title)}
                            </ExternalLink>
                        </td>
                        {includeClones && (
                            <td>{result.metadata?.cloneOf}</td>
                        )}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
