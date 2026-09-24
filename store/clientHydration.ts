let hydrated = false;
const waiters: Array<() => void> = [];

/** Resolves after cart / wishlist / compare have rehydrated from localStorage. */
export function whenClientStoresHydrated(): Promise<void> {
  if (hydrated) return Promise.resolve();
  return new Promise((resolve) => waiters.push(resolve));
}

export function markClientStoresHydrated() {
  if (hydrated) return;
  hydrated = true;
  waiters.splice(0).forEach((fn) => fn());
}
