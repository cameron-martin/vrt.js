import { ScreenshotKey } from './Backend';

export interface Report {
  screenshots: ScreenshotReport[];
}

export interface ScreenshotReport {
  key: ScreenshotKey;
  before: Buffer | null;
  after: Buffer | null;
  diff: Buffer | null;
  mismatchPercentage: number;
}

export interface Reporter {
  report(report: Report): Promise<void>;
}
