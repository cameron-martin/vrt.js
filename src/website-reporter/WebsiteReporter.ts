import { Reporter, Report } from '../core/Reporter';

export default class WebsiteReporter implements Reporter {
  report(report: Report): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
