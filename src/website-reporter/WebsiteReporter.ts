import { Reporter, Report, ScreenshotReport } from '../core/Reporter';
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

export default class WebsiteReporter implements Reporter {
  private screenshotsDir = path.join(
    this.config.outputDirectory,
    'screenshots',
  );
  private reportUrl = path.join(this.config.outputDirectory, 'index.html');

  constructor(private readonly config: Config) {}

  async report(report: Report): Promise<void> {
    await fs.emptyDir(this.config.outputDirectory);
    await fs.mkdir(this.screenshotsDir);

    const generateId = createIdGenerator();

    const screenshots = await Promise.all(
      report.screenshots.map(screenshot =>
        this.getScreenshotViewModel(screenshot, generateId),
      ),
    );

    const result = await ejs.renderFile<string>(
      require.resolve('./templates/index.ejs'),
      {
        screenshots,
      },
    );

    await fs.writeFile(this.reportUrl, result, 'utf8');
  }

  async getScreenshotViewModel(
    screenshot: ScreenshotReport,
    generateId: () => number,
  ): Promise<ScreenshotViewModel> {
    const [before, after, diff] = await Promise.all(
      [screenshot.before, screenshot.after, screenshot.diff].map(
        async screenshot => {
          const id = generateId();
          const filePath = path.join(this.screenshotsDir, `${id}.png`);

          await fs.writeFile(filePath, screenshot);

          return path.relative(path.dirname(this.reportUrl), filePath);
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
}
