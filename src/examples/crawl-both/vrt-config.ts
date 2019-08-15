import { Configuration } from '../../core/Configuration';
import { MatrixBackend } from '../../core/combinators';
import PuppeteerBrowser from '../../puppeteer-browser';
import PageBackend from '../../page-backend';
import WebsiteReporter from '../../website-reporter/WebsiteReporter';

const createBackend = (build: string) =>
  new MatrixBackend(
    { screenWidth: [400, 1024, 1280] },
    ({ screenWidth }) =>
      new PageBackend({
        browser: new PuppeteerBrowser({
          screenWidth,
        }),
        urls: [`http://localhost:1234/${build}/`],
        prefix: `http://localhost:1234/${build}/`,
        discoverUrls: true,
      }),
  );

/**
 * Compares two versions of the website by directly taking screenshots of both sides.
 */
const config: Configuration = {
  before: createBackend('before'),
  after: createBackend('after'),
  reporters: [
    new WebsiteReporter({
      outputDirectory: './reports/crawl-both',
    }),
  ],
};

export default config;
