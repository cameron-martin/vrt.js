import { Backend, Screenshot } from '../core/Backend';

export interface Config {
  /**
   * The list of urls to capture.
   */
  urls: string[];
  /**
   * Whether new urls are discovered
   */
  discoverUrls?: boolean;
  screenWidth: number;
}

export default class PuppeteerBackend implements Backend {
  getScreenshots(): AsyncIterableIterator<Screenshot> {
    throw new Error('Method not implemented.');
  }
  constructor(config: Config) {}
}
