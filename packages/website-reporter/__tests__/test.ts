import WebsiteReporter from '../';
import tempy from 'tempy';
import { Report } from '@vrt.js/core';
import fs from 'fs-extra';
import path from 'path';
import { getExampleScreenshot } from '../../../test-utils';

it('matches snapshot', async () => {
  const outputDirectory = tempy.directory();

  const websiteReporter = new WebsiteReporter({
    outputDirectory,
  });

  const exampleScreenshot = await getExampleScreenshot('screenshot1.png');

  const report: Report = {
    screenshots: [
      {
        properties: { key: '/foo', browser: 'Chrome', viewportWidth: 1024 },
        before: exampleScreenshot,
        after: exampleScreenshot,
        diff: exampleScreenshot,
        mismatchPercentage: 0,
      },
      {
        properties: { key: '/bar', browser: 'Chrome', viewportWidth: 1024 },
        before: exampleScreenshot,
        after: null,
        diff: null,
        mismatchPercentage: 100,
      },
      {
        properties: { key: '/baz', browser: 'Chrome', viewportWidth: 1024 },
        before: exampleScreenshot,
        after: exampleScreenshot,
        diff: exampleScreenshot,
        mismatchPercentage: 50,
      },
    ],
  };

  await websiteReporter.report(report);

  expect(
    await fs.readFile(path.join(outputDirectory, 'index.html'), 'utf8'),
  ).toMatchSnapshot();
});
