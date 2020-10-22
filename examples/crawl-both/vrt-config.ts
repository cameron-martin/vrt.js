import { Configuration, MatrixBackend } from '@vrt.js/core';
import PlaywrightBrowser from '@vrt.js/playwright-browser';
import PageBackend from '@vrt.js/page-backend';
import { generateReport } from '@vrt.js/website-reporter';
import path from 'path';

const createBackend = (build: string) =>
  new MatrixBackend(
    {
      viewportWidth: [400, 1024, 1280],
      product: ['chromium', 'firefox'] as const,
    },
    ({ viewportWidth, product }) =>
      new PageBackend({
        browser: new PlaywrightBrowser({
          viewportWidth,
          product,
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
      outputDirectory: path.resolve(__dirname, 'report'),
    });
  },
};

export default config;
