import fs from 'fs-extra';
import path from 'path';
import { Backend, Screenshot, Reporter, Report } from '@vrt.js/core';

export class MockBackend implements Backend {
  constructor(private readonly screenshots: Screenshot[]) {}
  async *getScreenshots() {
    for (const screenshot of this.screenshots) {
      yield screenshot;
    }
  }
}

export class MockReporter implements Reporter {
  private _report: Report | undefined;

  async report(report: Report): Promise<void> {
    if (!this._report) {
      this._report = report;
    } else {
      throw new Error('Reporter was called multiple times');
    }
  }

  getReport(): Report {
    if (this._report) {
      return this._report;
    } else {
      throw new Error('Reporter was not called yet');
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
