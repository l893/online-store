import { useEffect, useRef, useState } from 'react';
import { useRefreshMutation } from '../../features/auth';

export function useAuthBootstrap() {
  const authRefreshRequestPromiseReference = useRef(null);

  const [isAuthBootstrapped, setIsAuthBootstrapped] = useState(false);
  const [refresh] = useRefreshMutation();

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
        if (!authRefreshRequestPromiseReference.current) {
          authRefreshRequestPromiseReference.current = refresh().unwrap();
        }

        await authRefreshRequestPromiseReference.current;
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
  }, [refresh]);

  return isAuthBootstrapped;
}
