import { useEffect } from 'react';
import { subscribeToAuthSessionChanges } from '@features/auth';

export function useAuthSessionSynchronization() {
  useEffect(() => {
    return subscribeToAuthSessionChanges(() => {
      window.location.reload();
    });
  }, []);
}
