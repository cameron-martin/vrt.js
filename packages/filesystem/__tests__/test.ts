import { saveBaselines, FilesystemBackend } from '../';
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

  const report = {
    screenshots: [
      {
        before: exampleScreenshot,
        after: exampleScreenshot,
        diff: exampleScreenshot,
        properties: {
          key: 'placeholder-image',
          browser: 'chrome',
          viewportWidth: 1024,
        },
        mismatchPercentage: 0,
      },
    ],
  };

  await saveBaselines(report, {
    directory: tmpDir,
    if: () => true,
  });

  const backend = new FilesystemBackend(tmpDir);

  const screenshots = await asyncIterableToArray(backend.getScreenshots());

  expect(screenshots).toEqual([
    {
      properties: {
        key: 'placeholder-image',
        browser: 'chrome',
        viewportWidth: 1024,
      },
      image: exampleScreenshot,
    },
  ]);
});

test('previous baselines are cleared when updating them', async () => {
  const tmpDir = tempy.directory();

  const existingFile = path.join(tmpDir, 'existing-file');

  await fs.writeFile(existingFile, '');

  const report = {
    screenshots: [],
  };

  await saveBaselines(report, {
    directory: tmpDir,
    if: () => true,
  });

  expect(await fs.pathExists(existingFile)).toBe(false);
});

test('baselines only update if passed-in condition is true', async () => {
  const tmpDir = tempy.directory();

  const exampleScreenshot = await getExampleScreenshot('screenshot1.png');

  const report = {
    screenshots: [
      {
        before: exampleScreenshot,
        after: exampleScreenshot,
        diff: exampleScreenshot,
        properties: {
          key: 'placeholder-image',
          browser: 'chrome',
          viewportWidth: 1024,
        },
        mismatchPercentage: 0,
      },
    ],
  };

  await saveBaselines(report, {
    directory: tmpDir,
    if: () => false,
  });

  expect(await fs.readdir(tmpDir)).toHaveLength(0);
});