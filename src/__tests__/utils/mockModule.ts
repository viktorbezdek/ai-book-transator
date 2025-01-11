import { Mock, mock } from "bun:test";

export function createMockClass<T>(
  implementation: Partial<T>,
): new (...args: any[]) => T {
  return class MockClass {
    constructor(...args: any[]) {
      Object.assign(this, implementation);
    }
  } as any;
}
