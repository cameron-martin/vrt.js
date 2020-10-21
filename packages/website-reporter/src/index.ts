import { Report, ScreenshotProperties, ScreenshotReport } from '@vrt.js/core';
import fs from 'fs-extra';
import path from 'path';
import ejs from 'ejs';

function createIdGenerator() {
  let id = 0;
  return () => ++id;
}

interface ReportItemViewModel {
  properties: ScreenshotProperties;
  before: string | null;
  after: string | null;
  diff: string | null;
  mismatchPercentage: number;
}

interface Config {
  outputDirectory: string;
}

export async function generateReport(report: Report, config: Config) {
  const screenshotsDir = path.join(config.outputDirectory, 'screenshots');
  const reportUrl = path.join(config.outputDirectory, 'index.html');

  await fs.emptyDir(config.outputDirectory);
  await fs.mkdir(screenshotsDir);

  const generateId = createIdGenerator();

  const reportItems = await Promise.all(
    report.screenshots.map(screenshot =>
      getReportItemViewModel(screenshot, screenshotsDir, reportUrl, generateId),
    ),
  );

  const { failedItems, successfulItems } = partitionReportItems(reportItems);

  const result = await ejs.renderFile<string>(
    require.resolve('../templates/index.ejs'),
    {
      failedItems,
      successfulItems
    },
  );

  await fs.writeFile(reportUrl, result, 'utf8');
}

function partitionReportItems(reportItems: ReportItemViewModel[]) {
  const failedItems: ReportItemViewModel[] = [];
  const successfulItems: ReportItemViewModel[] = [];

  reportItems.forEach(reportItem => {
    if(reportItem.mismatchPercentage === 0) {
      successfulItems.push(reportItem);
    } else {
      failedItems.push(reportItem);
    }
  });

  return { failedItems, successfulItems };
}

async function getReportItemViewModel(
  screenshot: ScreenshotReport,
  screenshotsDir: string,
  reportUrl: string,
  generateId: () => number,
): Promise<ReportItemViewModel> {
  const [before, after, diff] = await Promise.all(
    [screenshot.before, screenshot.after, screenshot.diff].map(
      async screenshot => {
        if (screenshot == null) {
          return null;
        }

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
