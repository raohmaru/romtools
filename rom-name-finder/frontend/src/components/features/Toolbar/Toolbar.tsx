import { Button } from '../../ui/Button/Button';
import type { ViewMode } from '../../../types/schemas';
import { selectViewMode, useSearchStore } from '../../../stores/searchStore';
import styles from './Toolbar.module.css';
import { useState } from 'react';

export interface ToolbarProps {
    /**
     * Callback when copy button is clicked
     */
    onCopy: () => void;
    /**
     * Callback when export button is clicked
     */
    onExport: () => void;
}

export function Toolbar({
    onCopy,
    onExport
}: ToolbarProps) {
    const { setViewMode } = useSearchStore();
    const viewMode = useSearchStore(selectViewMode);
    const [copied, setCopied] = useState(false);

    // Toggle view mode handler
    const handleViewModeChange = (mode: ViewMode) => {
        setViewMode(mode);
    };

    function handleOnCopyClick(): void {
        onCopy();
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <aside className={styles['view-toolbar']} role="group" aria-label="Toolbar">
            <Button
                variant={viewMode === 'simple' ? 'primary' : 'secondary'}
                onClick={() => handleViewModeChange('simple')}
                aria-pressed={viewMode === 'simple'}
                aria-label="Simple view"
                title="Simple view"
                size='small'
            >
                <span aria-hidden="true">᎒</span>
            </Button>

            <Button
                variant={viewMode === 'detailed' ? 'primary' : 'secondary'}
                onClick={() => handleViewModeChange('detailed')}
                aria-pressed={viewMode === 'detailed'}
                aria-label="Detailed view"
                title="Detailed view"
                size='small'
            >
                <span aria-hidden="true">☰</span>
            </Button>

            &nbsp;

            <Button
                variant='secondary'
                onClick={handleOnCopyClick}
                aria-label="Copy ROM names to clipboard"
                title="Copy ROM names to clipboard"
                size='small'
            >
                <span aria-hidden="true">
                    {copied ? '✔' : '📋'}
                </span>
            </Button>

            <Button
                variant='secondary'
                onClick={onExport}
                aria-label="Export as CSV"
                title="Export as CSV"
                size='small'
            >
                <span aria-hidden="true">.csv</span>
            </Button>
        </aside>
    );
}
