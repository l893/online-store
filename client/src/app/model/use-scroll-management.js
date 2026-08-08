import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

function scrollWindowTo(scrollPosition) {
  window.scrollTo({
    top: scrollPosition,
    left: 0,
    behavior: 'auto',
  });
}

export function useScrollManagement() {
  const location = useLocation();
  const navigationType = useNavigationType();

  const scrollPositionsByLocationKeyRef = useRef(new Map());
  const currentLocationKeyRef = useRef(location.key);
  const previousLocationRef = useRef(null);

  useEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;

    window.history.scrollRestoration = 'manual';

    return () => {
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  useEffect(() => {
    function saveCurrentScrollPosition() {
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
    } else if (previousLocation.pathname !== location.pathname) {
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
