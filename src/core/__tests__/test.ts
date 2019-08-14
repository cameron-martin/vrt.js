import {
  MockBackend,
  MockReporter,
  getExampleScreenshot,
} from '../../test-utils';
import run from '../run';

test('diffs images correctly', async () => {
  const mockReporter = new MockReporter();

  await run({
    before: new MockBackend([
      {
        key: { name: 'my-screenshot' },
        image: await getExampleScreenshot('screenshot1.png'),
      },
    ]),
    after: new MockBackend([
      {
        key: { name: 'my-screenshot' },
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

it('matches up screenshots with the same key', async () => {
  const screenshot1 = await getExampleScreenshot('screenshot1.png');
  const screenshot2 = await getExampleScreenshot('screenshot2.png');

  const before = new MockBackend([
    {
      key: { name: 'my-screenshot-1' },
      image: screenshot1,
    },
    {
      key: { name: 'my-screenshot-2' },
      image: screenshot2,
    },
  ]);

  // These screenshots do not arrive in the same order as above.
  const after = new MockBackend([
    {
      key: { name: 'my-screenshot-2' },
      image: screenshot2,
    },
    {
      key: { name: 'my-screenshot-1' },
      image: screenshot1,
    },
  ]);

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
