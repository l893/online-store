import { useEffect, useState } from 'react';
import type { ReactElement } from 'react';

import styles from './back-to-top-button.module.scss';

const BACK_TO_TOP_VISIBILITY_THRESHOLD = 600;

export const BackToTopButton = (): ReactElement | null => {
  const [isBackToTopButtonVisible, setIsBackToTopButtonVisible] =
    useState(false);

  useEffect(() => {
    function updateBackToTopButtonVisibility(): void {
      setIsBackToTopButtonVisible(
        window.scrollY > BACK_TO_TOP_VISIBILITY_THRESHOLD,
      );
    }

    updateBackToTopButtonVisibility();

    window.addEventListener('scroll', updateBackToTopButtonVisibility, {
      passive: true,
    });

    return () => {
      window.removeEventListener('scroll', updateBackToTopButtonVisibility);
    };
  }, []);

  function handleBackToTopButtonClick(): void {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  }

  if (!isBackToTopButtonVisible) {
    return null;
  }

  return (
    <button
      className={styles.backToTopButton}
      type="button"
      aria-label="Наверх"
      title="Наверх"
      onClick={handleBackToTopButtonClick}
    >
      <span aria-hidden="true">↑</span>
    </button>
  );
};
