import fs from 'fs-extra';
import path from 'path';
import { Backend, Screenshot } from '@vrt.js/core';

export class MockBackend implements Backend {
  constructor(private readonly screenshots: Screenshot[]) {}
  async *getScreenshots() {
    for (const screenshot of this.screenshots) {
      yield screenshot;
    }
  }
}

export async function asyncIterableToArray<T>(
  iterable: AsyncIterable<T>,
): Promise<T[]> {
  const items: T[] = [];

  for await (const item of iterable) {
    items.push(item);
  }

  return items;
}

export function getExampleScreenshot(name: string): Promise<Buffer> {
  return fs.readFile(path.join(__dirname, 'screenshot-examples', name));
}
