import { Configuration, run } from '@vrt.js/core';
import PageBackend from '@vrt.js/page-backend';
import { FilesystemBackend, saveBaselines } from '@vrt.js/filesystem';
import { runStaticServer } from '../server';
import path from 'path';
import PuppeteerBrowser from '@vrt.js/puppeteer-browser';
import { generateReport } from '@vrt.js/website-reporter';
import { runExample } from '../run';

const reportPort = 8754;
const baselineDir = path.resolve(__dirname, 'baselines');

const vrtConfig: Configuration = {
  before: new FilesystemBackend(baselineDir),
  after: new PageBackend({
    browser: new PuppeteerBrowser({
      viewportWidth: 1920,
    }),
    urls: [`http://localhost:${reportPort}/index.html`],
    prefix: `http://localhost:${reportPort}`,
  }),
  async report(report) {
    // TODO: Find a way of hooking into jest's snapshot updating mechanism
    // See https://github.com/americanexpress/jest-image-snapshot/blob/d60e2e672e11dd9668122bcf8c3ac8a36bed0a8e/src/index.js#L204
    // and https://jestjs.io/docs/en/expect#custom-matchers-api
    if (process.env.UPDATE_BASELINES) {
      await saveBaselines(report, { directory: baselineDir });
    } else {
      await generateReport(report, {
        outputDirectory: path.resolve(__dirname, 'report'),
      });
      report.failOnMismatches();
    }
  },
};

jest.setTimeout(60000);

test('report matches baseline images', async () => {
  await runExample();
  console.log((jest as any).snapshotState);

  const server = await runStaticServer(
    reportPort,
    path.resolve(__dirname, '..', 'report'),
  );

  try {
    await run(vrtConfig);
  } finally {
    server.close();
  }
});
