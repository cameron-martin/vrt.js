import { Report, ScreenshotReport } from '@vrt.js/core';
import fs from 'fs-extra';
import path from 'path';
import ejs from 'ejs';

function createIdGenerator() {
  let id = 0;
  return () => ++id;
}

type ScreenshotKeys = 'before' | 'after' | 'diff';

type ScreenshotViewModel = {
  [K in keyof ScreenshotReport]: K extends ScreenshotKeys
    ? string
    : ScreenshotReport[K];
};

interface Config {
  outputDirectory: string;
}

export async function generateReport(report: Report, config: Config) {
  const screenshotsDir = path.join(config.outputDirectory, 'screenshots');
  const reportUrl = path.join(config.outputDirectory, 'index.html');

  await fs.emptyDir(config.outputDirectory);
  await fs.mkdir(screenshotsDir);

  const generateId = createIdGenerator();

  const screenshots = await Promise.all(
    report.screenshots.map(screenshot =>
      getScreenshotViewModel(screenshot, screenshotsDir, reportUrl, generateId),
    ),
  );

  const result = await ejs.renderFile<string>(
    require.resolve('../templates/index.ejs'),
    {
      screenshots,
    },
  );

  await fs.writeFile(reportUrl, result, 'utf8');
}

async function getScreenshotViewModel(
  screenshot: ScreenshotReport,
  screenshotsDir: string,
  reportUrl: string,
  generateId: () => number,
): Promise<ScreenshotViewModel> {
  const [before, after, diff] = await Promise.all(
    [screenshot.before, screenshot.after, screenshot.diff].map(
      async screenshot => {
        const id = generateId();
        const filePath = path.join(screenshotsDir, `${id}.png`);

        await fs.writeFile(filePath, screenshot);

        return path.relative(path.dirname(reportUrl), filePath);
      },
    ),
  );

  return {
    ...screenshot,
    before,
    after,
    diff,
  };
}
