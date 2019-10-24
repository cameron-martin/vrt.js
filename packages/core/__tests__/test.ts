import { MockBackend, getExampleScreenshot } from '../../../test-utils';
import { run } from '../';

test('diffs images correctly', async () => {
  const report = jest.fn();

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
    report,
  });

  const myReport = report.mock.calls[0][0];

  expect(myReport.screenshots).toHaveLength(1);
  const screenshot = myReport.screenshots[0];

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

  const report = jest.fn();

  await run({
    before,
    after,
    report,
  });

  const myReport = report.mock.calls[0][0];

  for (const screenshot of myReport.screenshots) {
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

  const report = jest.fn();

  await run({
    before,
    after,
    report,
  });

  const myReport = report.mock.calls[0][0];

  expect(myReport.screenshots).toHaveLength(1);
  const screenshot = myReport.screenshots[0];

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

it('calls the report callback', async () => {
  const backend = new MockBackend([]);

  const report = jest.fn();

  await run({
    before: backend,
    after: backend,
    report,
  });

  expect(report).toHaveBeenCalledTimes(1);
  expect(report).toHaveBeenCalledWith({ screenshots: [] });
});
