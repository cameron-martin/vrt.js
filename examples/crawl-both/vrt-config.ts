import { Configuration, MatrixBackend } from '@vrt.js/core';
import PuppeteerBrowser from '@vrt.js/puppeteer-browser';
import PageBackend from '@vrt.js/page-backend';
import { generateReport } from '@vrt.js/website-reporter';

const createBackend = (build: string) =>
  new MatrixBackend(
    { viewportWidth: [400, 1024, 1280] },
    ({ viewportWidth }) =>
      new PageBackend({
        browser: new PuppeteerBrowser({
          viewportWidth,
        }),
        urls: [`http://localhost:1234/${build}/index.html`],
        prefix: `http://localhost:1234/${build}`,
        discoverUrls: true,
      }),
  );

/**
 * Compares two versions of the website by directly taking screenshots of both sides.
 */
const config: Configuration = {
  before: createBackend('before'),
  after: createBackend('after'),
  async report(report) {
    await generateReport(report, {
      outputDirectory: './reports/crawl-both',
    });
  },
};

export default config;
