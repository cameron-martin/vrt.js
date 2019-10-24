import {
  MockBackend,
  MockReporter,
  getExampleScreenshot,
} from '../../../test-utils';
import { run } from '../';

test('diffs images correctly', async () => {
  const mockReporter = new MockReporter();

  const properties = {
    key: 'my-screenshot',
    browser: 'chrome',
    viewportWidth: 1024,
  };

  await run({
    before: new MockBackend([
      {
        properties,
        image: await getExampleScreenshot('screenshot1.png'),
      },
    ]),
    after: new MockBackend([
      {
        properties,
        image: await getExampleScreenshot('screenshot2.png'),
      },
    ]),
    reporters: [mockReporter],
  });

  const report = mockReporter.getReport();

  expect(report.screenshots).toHaveLength(1);
  const screenshot = report.screenshots[0];

  expect(screenshot.diff).toMatchImageSnapshot();
  expect(screenshot.mismatchPercentage).toMatchInlineSnapshot(`7.08`);
});

it('matches up screenshots with the same properties', async () => {
  const screenshot1 = {
    properties: {
      key: 'my-screenshot-1',
      browser: 'chrome',
      viewportWidth: 1024,
    },
    image: await getExampleScreenshot('screenshot1.png'),
  };

  const screenshot2 = {
    properties: {
      key: 'my-screenshot-1',
      browser: 'firefox',
      viewportWidth: 1024,
    },
    image: await getExampleScreenshot('screenshot2.png'),
  };

  const screenshot3 = {
    properties: {
      key: 'my-screenshot-2',
      browser: 'chrome',
      viewportWidth: 1024,
    },
    image: await getExampleScreenshot('screenshot3.png'),
  };

  // Note that the screenshots arrive out-of-order
  const before = new MockBackend([screenshot1, screenshot2, screenshot3]);
  const after = new MockBackend([screenshot3, screenshot2, screenshot1]);

  const mockReporter = new MockReporter();

  await run({
    before,
    after,
    reporters: [mockReporter],
  });

  const report = mockReporter.getReport();

  for (const screenshot of report.screenshots) {
    expect(screenshot.mismatchPercentage).toBe(0);
  }
});

it('handles when either a before or after screenshot is not present', async () => {
  const beforeScreenshot = await getExampleScreenshot('screenshot1.png');

  const before = new MockBackend([
    {
      properties: {
        key: 'my-screenshot',
        browser: 'chrome',
        viewportWidth: 1024,
      },
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
  expect(screenshot.properties).toEqual({
    key: 'my-screenshot',
    browser: 'chrome',
    viewportWidth: 1024,
  });
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
