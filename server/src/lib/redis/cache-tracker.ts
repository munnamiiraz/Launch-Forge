import { AsyncLocalStorage } from "async_hooks";

export const cacheStorage = new AsyncLocalStorage<Map<string, string>>();

export const getCacheStatus = () => {
  const store = cacheStorage.getStore();
  return store?.get("status");
};

export const setCacheStatus = (status: "HIT" | "MISS") => {
  const store = cacheStorage.getStore();
  store?.set("status", status);
};
