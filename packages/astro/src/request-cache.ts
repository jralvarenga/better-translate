import { AsyncLocalStorage } from "node:async_hooks";

type RequestCacheStore = {
  cache: Map<symbol, unknown>;
};

const requestCacheStorage = new AsyncLocalStorage<RequestCacheStore>();

function getOrCreateRequestCacheStore() {
  const existingStore = requestCacheStorage.getStore();

  if (existingStore) {
    return existingStore;
  }

  const nextStore: RequestCacheStore = {
    cache: new Map(),
  };

  requestCacheStorage.enterWith(nextStore);

  return nextStore;
}

export function readRequestCached<TValue>(
  key: symbol,
  factory: () => TValue,
): TValue {
  const store = getOrCreateRequestCacheStore();

  if (store.cache.has(key)) {
    return store.cache.get(key) as TValue;
  }

  const value = factory();
  store.cache.set(key, value);

  return value;
}
