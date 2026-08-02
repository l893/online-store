const AUTH_SESSION_CHANGE_STORAGE_KEY = 'authSessionChange';

export function publishAuthSessionChange(
  sessionChangeIdentifier = crypto.randomUUID(),
) {
  localStorage.setItem(
    AUTH_SESSION_CHANGE_STORAGE_KEY,
    sessionChangeIdentifier,
  );
}

export function subscribeToAuthSessionChanges(listener) {
  function handleStorageEvent(event) {
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
