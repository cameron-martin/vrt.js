import { Backend } from './Backend';
import { Report } from './Report';

export interface Configuration {
  before: Backend;
  after: Backend;
  report(report: Report): Promise<void> | void;
}
