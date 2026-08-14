import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

type RouterLocation = ReturnType<typeof useLocation>;

function shouldScrollNavigationToTop(locationState: unknown): boolean {
  return (
    typeof locationState === 'object' &&
    locationState !== null &&
    'shouldScrollToTop' in locationState &&
    locationState.shouldScrollToTop === true
  );
}

function scrollWindowTo(scrollPosition: number): void {
  window.scrollTo({
    top: scrollPosition,
    left: 0,
    behavior: 'auto',
  });
}

export function useScrollManagement(): void {
  const location = useLocation();
  const navigationType = useNavigationType();

  const scrollPositionsByLocationKeyRef = useRef(new Map<string, number>());
  const currentLocationKeyRef = useRef<string>(location.key);
  const previousLocationRef = useRef<RouterLocation | null>(null);

  useEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;

    window.history.scrollRestoration = 'manual';

    return () => {
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  useEffect(() => {
    function saveCurrentScrollPosition(): void {
      scrollPositionsByLocationKeyRef.current.set(
        currentLocationKeyRef.current,
        window.scrollY,
      );
    }

    saveCurrentScrollPosition();

    window.addEventListener('scroll', saveCurrentScrollPosition, {
      passive: true,
    });

    return () => {
      window.removeEventListener('scroll', saveCurrentScrollPosition);
    };
  }, []);

  useLayoutEffect(() => {
    const previousLocation = previousLocationRef.current;

    currentLocationKeyRef.current = location.key;

    if (!previousLocation) {
      scrollPositionsByLocationKeyRef.current.set(location.key, window.scrollY);
      previousLocationRef.current = location;
      return;
    }

    let targetScrollPosition = window.scrollY;

    if (navigationType === 'POP') {
      targetScrollPosition =
        scrollPositionsByLocationKeyRef.current.get(location.key) ?? 0;

      scrollWindowTo(targetScrollPosition);
    } else if (
      shouldScrollNavigationToTop(location.state) ||
      previousLocation.pathname !== location.pathname
    ) {
      targetScrollPosition = 0;
      scrollWindowTo(targetScrollPosition);
    }

    scrollPositionsByLocationKeyRef.current.set(
      location.key,
      targetScrollPosition,
    );
    previousLocationRef.current = location;
  }, [location, navigationType]);
}
