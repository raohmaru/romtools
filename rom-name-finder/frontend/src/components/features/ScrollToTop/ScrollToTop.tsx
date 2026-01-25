import { useState, useEffect } from 'react';
import { Button } from '../../ui/Button/Button';
import styles from './ScrollToTop.module.css';

const SCROLL_LIMIT = 2000;

export const ScrollToTop = () => {
    const [animClass, setAnimClass] = useState('');

    useEffect(() => {
        const handleScroll = () => {
            const { scrollY } = window;
            if (scrollY < SCROLL_LIMIT && animClass === styles.enter) {
                setAnimClass(styles.exit);
            }
            if (scrollY >= SCROLL_LIMIT) {
                setAnimClass(styles.enter);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [animClass]);

    const handleScrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <Button
            variant="primary"
            size="medium"
            className={`${styles.scrollToTop} ${animClass || ''}`}
            onClick={handleScrollToTop}
            aria-label="Scroll to top"
        >
            <img
                src='img/gradius.svg'
                alt='Gradius'
                width={24}
            />
        </Button>
    );
};
