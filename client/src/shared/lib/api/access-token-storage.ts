const ACCESS_TOKEN_STORAGE_KEY = 'accessToken';

export function getStoredAccessToken(): string | null {
  try {
    return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function storeAccessToken(accessToken: string | null | undefined): void {
  if (!accessToken) {
    removeStoredAccessToken();
    return;
  }

  try {
    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
  } catch {
    // Storage может быть недоступен из-за настроек браузера.
  }
}

export function removeStoredAccessToken(): void {
  try {
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  } catch {
    // Ошибка очистки не должна ломать logout или bootstrap.
  }
}
