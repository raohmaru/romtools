import styles from './SearchResults.module.css';
import { ExternalLink } from './ExternalLink';
import type { SearchResult } from './SearchResults';
import { Headline } from '../../ui/Headline/Headline';

export interface SearchResultViewPros {
    results: SearchResult[];
    includeClones?: boolean;
}

// Detailed view component
export const DetailedResults = ({ results }: SearchResultViewPros) => {
    return (
        <ul className={styles['detailed-list']} aria-label="Results list">
            {results.map((result, index) => (
                <li key={index} className={styles['detailed-result']}>                    
                    <img
                        src={`${import.meta.env.VITE_ICONS_HOST}/img/icons/${result.metadata?.ROM}.png`}
                        width={32}
                        height={32}
                        alt={result.title}
                        loading='lazy'
                        onError={(e) => {
                            const currentTarget = e.target as HTMLImageElement;
                            currentTarget.onerror = null; // prevents looping
                            currentTarget.src = '/img/not-found-rom.png';
                        }}
                    />

                    <div className={styles['result-body']}>
                        <Headline
                            level={3}
                            className={styles['result-title']}
                        >
                            <ExternalLink
                                type='moby'
                                result={result}
                                className={styles['external-link']}
                            >
                                <span dangerouslySetInnerHTML={{ __html: result.title }}></span>
                            </ExternalLink>
                        </Headline>
                        {result.metadata && Object.keys(result.metadata).length > 0 && (
                            <div className={styles['result-meta']}>
                                {Object.entries(result.metadata).map(([key, value]) => {
                                    if (value === null || value === undefined || value === '') {
                                        return null;
                                    }
                                    return (
                                        <span key={key} className={styles['meta-item']}>
                                            <span className={styles['meta-label']}>
                                                {key}:
                                            </span>
                                            {key === 'ROM' && (
                                                <ExternalLink
                                                    type='adb'
                                                    result={result}
                                                    className={styles['external-link']}
                                                >
                                                    {String(value)}
                                                </ExternalLink>
                                            ) || (
                                                <span>{String(value)}</span>
                                            )}
                                        </span>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className={styles['result-external']}>
                        <ExternalLink
                            type='adb'
                            result={result}
                            className={styles['external-icon']}
                        >
                            <img
                                src="/img/adb.png"
                                alt="Check the game in Arcade Database"
                                width={20}
                            />
                        </ExternalLink>
                        <ExternalLink
                            type='moby'
                            result={result}
                            className={styles['external-icon']}
                        >
                            <img
                                src="/img/moby.png"
                                alt="Check the game in MobyGames "
                                width={20}
                            />
                        </ExternalLink>
                        <ExternalLink
                            type='igdb'
                            result={result}
                            className={styles['external-icon']}
                        >
                            <img
                                src="/img/igdb.svg"
                                alt="Check the game in IGDB "
                                width={20}
                            />
                        </ExternalLink>
                    </div>
                </li>
            ))}
        </ul>
    );
}
