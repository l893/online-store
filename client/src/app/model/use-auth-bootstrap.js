import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useRefreshMutation } from '../../features/auth';
import { setCartItems, useLazyGetCartQuery } from '../../features/cart';

export function useAuthBootstrap() {
  const authenticatedSessionBootstrapPromiseReference = useRef(null);

  const [isAuthBootstrapped, setIsAuthBootstrapped] = useState(false);

  const dispatch = useDispatch();

  const [refresh] = useRefreshMutation();
  const [getCart] = useLazyGetCartQuery();

  useEffect(() => {
    let isMounted = true;

    async function bootstrapAuth() {
      const hasStoredAccessToken = Boolean(localStorage.getItem('accessToken'));

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
