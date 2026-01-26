import styles from './SearchResults.module.css';
import { ExternalLink } from './ExternalLink';
import type { SearchResult } from './SearchResults';
import { Headline } from '../../ui/Headline/Headline';
import { List, useDynamicRowHeight , type RowComponentProps } from 'react-window';
import { sanitizeROM } from '@/utils/security';
import { decode } from 'html-entities';

export interface SearchResultViewPros {
    results: SearchResult[];
    includeClones?: boolean;
}

const mapMeta: { [key: string]: string } = {
    cloneOf: 'Clone of',
};

const Row = ({
    index,
    style,
    results
}: RowComponentProps<{ results: SearchResult[]; }>) => {
    const result = results[index];

    return (
        <div style={style} className={styles['virtualized-row']}>
            <div key={index} className={styles['detailed-result']}>
                <img
                    src={`${import.meta.env.VITE_ICONS_HOST}/img/icons/${sanitizeROM(String(result.metadata?.ROM))}.png`}
                    width={32}
                    height={32}
                    alt={result.title}
                    loading='lazy'
                    onError={(e) => {
                        const currentTarget = e.target as HTMLImageElement;
                        currentTarget.onerror = null; // prevents looping
                        currentTarget.src = 'img/not-found-rom.png';
                    }}
                    className={styles['result-icon']}
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
                            {decode(result.title)}
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
                                            {mapMeta[key] || key}:
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
                            src='img/adb.png'
                            alt='Check the game in Arcade Database'
                            width={20}
                        />
                    </ExternalLink>
                    <ExternalLink
                        type='moby'
                        result={result}
                        className={styles['external-icon']}
                    >
                        <img
                            src='img/moby.png'
                            alt='Check the game in MobyGames '
                            width={20}
                        />
                    </ExternalLink>
                    <ExternalLink
                        type='igdb'
                        result={result}
                        className={styles['external-icon']}
                    >
                        <img
                            src='img/igdb.svg'
                            alt='Check the game in IGDB '
                            width={20}
                        />
                    </ExternalLink>
                </div>
            </div>
        </div>
    );
};


// Detailed view component
export const DetailedResults = ({ results }: SearchResultViewPros) => {
    const rowHeight = useDynamicRowHeight({
        defaultRowHeight: 80
    });

    return (
        <div className={styles['virtualized-container']} aria-label='Results list'>
            <List
                rowComponent={Row}
                rowCount={results.length}
                rowHeight={rowHeight}
                rowProps={{ results }}
                style={{ height: '90dvh' }}
            />
        </div>
    );
}
