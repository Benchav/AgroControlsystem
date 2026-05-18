export function readJson<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    if (!value) return fallback;
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function writeJson<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function readJsonSafe<T>(key: string, fallback: T): T {
  try {
    return readJson(key, fallback);
  } catch {
    return fallback;
  }
}

export function writeJsonSafe<T>(key: string, value: T) {
  try {
    writeJson(key, value);
  } catch {
    // Ignore persistence failures.
  }
}
