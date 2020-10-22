import { Backend } from './Backend';
import { Report } from './Report';

export interface Configuration {
  /**
   * The backend used to generate the screenshots for the "before" side of the comparison
   */
  before: Backend;
  /**
   * The backend used to generate the screenshots for the "after" side of the comparison
   */
  after: Backend;
  report(report: Report): Promise<void> | void;
}
