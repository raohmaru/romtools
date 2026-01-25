import type { ComponentPropsWithoutRef, ElementType } from 'react';
import { memo } from 'react';
import styles from './Headline.module.css';

export interface HeadlineProps extends ComponentPropsWithoutRef<'h1'> {
    /**
     * The heading level (1-6)
     */
    level?: 1 | 2 | 3 | 4 | 5 | 6;
    /**
     * Additional CSS class name
     */
    className?: string;
    /**
     * The content to display
     */
    children: React.ReactNode;
}

const levelToElement: Record<number, ElementType> = {
    1: 'h1',
    2: 'h2',
    3: 'h3',
    4: 'h4',
    5: 'h5',
    6: 'h6',
};

export const Headline = memo(({
    level = 1,
    className = '',
    children,
    ...props
}: HeadlineProps) => {
    const Element = levelToElement[level] || 'h1';
    const combinedClassName = `${styles.headline} ${styles[`level-${level}`]} ${className}`.trim();

    return (
        <Element className={combinedClassName} {...props}>
            {children}
        </Element>
    );
});
