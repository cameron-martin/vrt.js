import { FilesystemReporter, FilesystemBackend } from '../';
import tempy from 'tempy';
import fs from 'fs-extra';
import path from 'path';
import {
  getExampleScreenshot,
  asyncIterableToArray,
} from '../../../test-utils';

test('backend correctly reads baselines written by the reporter', async () => {
  const tmpDir = tempy.directory();

  const exampleScreenshot = await getExampleScreenshot('screenshot1.png');

  const reporter = new FilesystemReporter({
    directory: tmpDir,
    if: () => true,
  });

  await reporter.report({
    screenshots: [
      {
        before: exampleScreenshot,
        after: exampleScreenshot,
        diff: exampleScreenshot,
        key: { name: 'placeholder-image' },
        mismatchPercentage: 0,
      },
    ],
  });

  const backend = new FilesystemBackend(tmpDir);

  const screenshots = await asyncIterableToArray(backend.getScreenshots());

  expect(screenshots).toEqual([
    { key: { name: 'placeholder-image' }, image: exampleScreenshot },
  ]);
});

test('previous baselines are cleared when updating them', async () => {
  const tmpDir = tempy.directory();

  const existingFile = path.join(tmpDir, 'existing-file');

  await fs.writeFile(existingFile, '');

  const reporter = new FilesystemReporter({
    directory: tmpDir,
    if: () => true,
  });

  await reporter.report({
    screenshots: [],
  });

  expect(await fs.pathExists(existingFile)).toBe(false);
});

test('baselines only update if passed-in condition is true', async () => {
  const tmpDir = tempy.directory();

  const exampleScreenshot = await getExampleScreenshot('screenshot1.png');

  const reporter = new FilesystemReporter({
    directory: tmpDir,
    if: () => false,
  });

  await reporter.report({
    screenshots: [
      {
        before: exampleScreenshot,
        after: exampleScreenshot,
        diff: exampleScreenshot,
        key: { name: 'placeholder-image' },
        mismatchPercentage: 0,
      },
    ],
  });

  expect(await fs.readdir(tmpDir)).toHaveLength(0);
});
