import { ScreenshotProperties } from './Backend';

export class Report {
  constructor(public readonly screenshots: ScreenshotReport[]) {}

  failOnMismatches() {
    if (
      this.screenshots.some((screenshot) => screenshot.mismatchPercentage !== 0)
    ) {
      throw new Error('Some screenshots have a mismatch');
    }
  }
}

export interface ScreenshotReport {
  properties: ScreenshotProperties;
  before: Buffer | null;
  after: Buffer | null;
  diff: Buffer | null;
  mismatchPercentage: number;
}
