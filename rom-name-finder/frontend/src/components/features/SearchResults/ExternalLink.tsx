import type { SearchResult } from "./SearchResults";

interface ExternalLinkProps {
    type: 'adb' | 'moby' | 'igdb';
    result: SearchResult;
    className?: string;
    children: React.ReactNode;
}

export const ExternalLink = ({
    type,
    result,
    className,
    children
}: ExternalLinkProps) => {
    let href = '';
    let title = '';
    const gameName = result.title.replace(/\(.+/, '');
    switch (type) {
        case 'adb':
            href = `http://adb.arcadeitalia.net/dettaglio_mame.php?game_name=${result.metadata?.ROM}`;
            title = 'Check the game in Arcade Database';
            break;

        case 'moby':
            href = `https://www.mobygames.com/game/include_dlc:false/platform:arcade/release_status:all/sort:moby_score/title:${gameName}/`;
            title = 'Search the game in MobyGames';
            break;

        case 'igdb':
            href = `https://www.igdb.com/search??utf8=✓&type=1&q=${gameName}`;
            title = 'Search the game in IGDB';
            break;
    }
    return (
        <a
            href={href}
            target='_blank'
            className={className}
            title={title}
            rel="noopener noreferrer"
        >
            {children}
        </a>
    );
}
