export function readKey(store: Storage, key: string): string | null {
  try {
    return store.getItem(key);
  } catch {
    return null;
  }
}

export function writeKey(store: Storage, key: string, value: string): void {
  try {
    store.setItem(key, value);
  } catch {
    // quota / private mode
  }
}

export function removeKey(store: Storage, key: string): void {
  try {
    store.removeItem(key);
  } catch {
    // private mode
  }
}
