import { webcrypto } from "node:crypto";
import { beforeEach } from "vitest";

class LocalStorageMock implements Storage {
  private store: Record<string, string> = {};

  get length(): number {
    return Object.keys(this.store).length;
  }

  clear(): void {
    this.store = {};
  }

  getItem(key: string): string | null {
    return Object.prototype.hasOwnProperty.call(
      this.store,
      key,
    )
      ? this.store[key]
      : null;
  }

  key(index: number): string | null {
    return Object.keys(this.store)[index] ?? null;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  setItem(
    key: string,
    value: string,
  ): void {
    this.store[key] = String(value);
  }
}

Object.defineProperty(
  globalThis,
  "localStorage",
  {
    value: new LocalStorageMock(),
    configurable: true,
  },
);

Object.defineProperty(
  globalThis,
  "crypto",
  {
    value: webcrypto,
    configurable: true,
  },
);

beforeEach(() => {
  localStorage.clear();
});