import { useEffect, useRef, useState } from 'react';

import { useRefreshMutation } from '@features/auth';
import { setCartItems, useLazyGetCartQuery } from '@features/cart';
import { getStoredAccessToken } from '@shared/lib';

import { useAppDispatch } from '../store/hooks';

export function useAuthBootstrap(): boolean {
  const authenticatedSessionBootstrapPromiseReference =
    useRef<Promise<void> | null>(null);

  const [isAuthBootstrapped, setIsAuthBootstrapped] = useState(false);

  const dispatch = useAppDispatch();

  const [refresh] = useRefreshMutation();
  const [getCart] = useLazyGetCartQuery();

  useEffect(() => {
    let isMounted = true;

    async function bootstrapAuth() {
      const hasStoredAccessToken = Boolean(getStoredAccessToken());

      if (!hasStoredAccessToken) {
        if (isMounted) {
          setIsAuthBootstrapped(true);
        }

        return;
      }

      try {
        if (!authenticatedSessionBootstrapPromiseReference.current) {
          authenticatedSessionBootstrapPromiseReference.current = (async () => {
            await refresh().unwrap();

            const serverCart = await getCart().unwrap();
            const serverCartItems = Array.isArray(serverCart.items)
              ? serverCart.items
              : [];

            dispatch(setCartItems(serverCartItems));
          })();
        }

        await authenticatedSessionBootstrapPromiseReference.current;
      } catch {
        // Невалидная refresh-сессия очищается в auth API lifecycle.
      } finally {
        if (isMounted) {
          setIsAuthBootstrapped(true);
        }
      }
    }

    bootstrapAuth();

    return () => {
      isMounted = false;
    };
  }, [dispatch, getCart, refresh]);

  return isAuthBootstrapped;
}
