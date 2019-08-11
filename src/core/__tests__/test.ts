import run from '../run';
import { Backend, Screenshot } from '../Backend';
import fs from 'fs-extra';
import path from 'path';
import { Reporter, Report } from '../Reporter';

class MockBackend implements Backend {
  constructor(private readonly screenshots: Screenshot[]) {}
  async *getScreenshots() {
    for (const screenshot of this.screenshots) {
      yield screenshot;
    }
  }
}

class MockReporter implements Reporter {
  private _report: Report | undefined;

  async report(report: Report): Promise<void> {
    if (!this._report) {
      this._report = report;
    } else {
      throw new Error('Reporter was called multiple times');
    }
  }

  getReport(): Report {
    if (this._report) {
      return this._report;
    } else {
      throw new Error('Reporter was not called yet');
    }
  }
}

test('diffs images correctly', async () => {
  const [before, after] = await Promise.all(
    ['before-example.png', 'after-example.png'].map(
      async fileName =>
        new MockBackend([
          {
            key: { name: 'my-screenshot' },
            image: await fs.readFile(path.join(__dirname, fileName)),
          },
        ]),
    ),
  );

  const mockReporter = new MockReporter();

  await run({
    before,
    after,
    reporters: [mockReporter],
  });

  const report = mockReporter.getReport();

  expect(report.screenshots).toHaveLength(1);
  const screenshot = report.screenshots[0];

  expect(screenshot.diff).toMatchImageSnapshot();
  expect(screenshot.mismatchPercentage).toMatchInlineSnapshot(`7.08`);
});

it.todo('matches up screenshots with the same key');

it('handles when either a before or after screenshot is not present', async () => {
  const beforeScreenshot = await fs.readFile(
    path.join(__dirname, 'before-example.png'),
  );

  const before = new MockBackend([
    {
      key: { name: 'my-screenshot' },
      image: beforeScreenshot,
    },
  ]);

  const after = new MockBackend([]);

  const mockReporter = new MockReporter();

  await run({
    before,
    after,
    reporters: [mockReporter],
  });

  const report = mockReporter.getReport();

  expect(report.screenshots).toHaveLength(1);
  const screenshot = report.screenshots[0];

  expect(screenshot.before!.equals(beforeScreenshot)).toBe(true);
  expect(screenshot.after).toBeNull();
  expect(screenshot.diff).toBeNull();
  expect(screenshot.mismatchPercentage).toBe(100);
  expect(screenshot.key).toEqual({ name: 'my-screenshot' });
});

it('gives the report to all reporters', async () => {
  const backend = new MockBackend([]);

  const reporters = [new MockReporter(), new MockReporter()];

  await run({
    before: backend,
    after: backend,
    reporters,
  });

  reporters.forEach(reporter => {
    expect(reporter.getReport()).toEqual({ screenshots: [] });
  });
});
