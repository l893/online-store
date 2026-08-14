const AUTH_SESSION_CHANGE_STORAGE_KEY = 'authSessionChange';

export function publishAuthSessionChange(
  sessionChangeIdentifier: string = crypto.randomUUID(),
): void {
  localStorage.setItem(
    AUTH_SESSION_CHANGE_STORAGE_KEY,
    sessionChangeIdentifier,
  );
}

export function subscribeToAuthSessionChanges(
  listener: () => void,
): () => void {
  function handleStorageEvent(event: StorageEvent): void {
    if (event.key !== AUTH_SESSION_CHANGE_STORAGE_KEY || !event.newValue) {
      return;
    }

    listener();
  }

  window.addEventListener('storage', handleStorageEvent);

  return () => {
    window.removeEventListener('storage', handleStorageEvent);
  };
}
