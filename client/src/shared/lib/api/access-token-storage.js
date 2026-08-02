const ACCESS_TOKEN_STORAGE_KEY = 'accessToken';

export function getStoredAccessToken() {
  try {
    return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function storeAccessToken(accessToken) {
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

export function removeStoredAccessToken() {
  try {
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  } catch {
    // Ошибка очистки не должна ломать logout или bootstrap.
  }
}
