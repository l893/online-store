import { useEffect } from 'react';

import { subscribeToAuthSessionChanges } from '@features/auth';

export function useAuthSessionSynchronization(): void {
  useEffect(() => {
    return subscribeToAuthSessionChanges(() => {
      window.location.reload();
    });
  }, []);
}
