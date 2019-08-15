import WebsiteReporter from '../WebsiteReporter';
import tempy from 'tempy';
import { Report } from '../../core/Reporter';
import fs from 'fs-extra';
import path from 'path';
import { getExampleScreenshot } from '../../test-utils/index';

it('matches snapshot', async () => {
  const outputDirectory = tempy.directory();

  const websiteReporter = new WebsiteReporter({
    outputDirectory,
  });

  const exampleScreenshot = await getExampleScreenshot('screenshot1.png');

  const report: Report = {
    screenshots: [
      {
        key: { path: '/foo' },
        before: exampleScreenshot,
        after: exampleScreenshot,
        diff: exampleScreenshot,
        mismatchPercentage: 0,
      },
      {
        key: { path: '/bar' },
        before: exampleScreenshot,
        after: null,
        diff: null,
        mismatchPercentage: 100,
      },
      {
        key: { path: '/baz' },
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
