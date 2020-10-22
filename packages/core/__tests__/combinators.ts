import { isEqual } from 'lodash';
import {
  MockBackend,
  getExampleScreenshot,
  asyncIterableToArray,
} from '../../../test-utils';
import { Screenshot, CompositeBackend, MatrixBackend } from '..';

describe('CompositeBackend', () => {
  it('yields screenshots from all backends', async () => {
    const chromeScreenshots: Screenshot[] = [
      {
        properties: { key: '1', browser: 'chrome', viewportWidth: 1024 },
        image: await getExampleScreenshot('screenshot1.png'),
      },
      {
        properties: { key: '2', browser: 'chrome', viewportWidth: 1024 },
        image: await getExampleScreenshot('screenshot2.png'),
      },
    ];

    const firefoxScreenshots: Screenshot[] = [
      {
        properties: { key: '1', browser: 'firefox', viewportWidth: 1024 },
        image: await getExampleScreenshot('screenshot1.png'),
      },
      {
        properties: { key: '2', browser: 'firefox', viewportWidth: 1024 },
        image: await getExampleScreenshot('screenshot2.png'),
      },
    ];

    const inputScreenshots = chromeScreenshots.concat(firefoxScreenshots);

    const compositeBackend = new CompositeBackend([
      new MockBackend(chromeScreenshots),
      new MockBackend(firefoxScreenshots),
    ]);

    const outputScrenshots = await asyncIterableToArray(
      compositeBackend.getScreenshots(),
    );

    expect(outputScrenshots.length).toBe(inputScreenshots.length);
    for (const outputScreenshot of outputScrenshots) {
      expect(
        inputScreenshots.some((inputScreenshot) =>
          isEqual(outputScreenshot, inputScreenshot),
        ),
      );
    }
  });
});

describe('MatrixBackend', () => {
  it('yields items from backends of all combinations of matrix', async () => {
    const image = await getExampleScreenshot('screenshot2.png');

    const backend = new MatrixBackend(
      { viewportWidth: [400, 1024], browser: ['Chrome', 'Firefox'] },
      ({ viewportWidth, browser }) =>
        new MockBackend([
          { properties: { key: 'test-image', viewportWidth, browser }, image },
        ]),
    );

    const screenshots = await asyncIterableToArray(backend.getScreenshots());

    expect(screenshots.length).toBe(4);
    [
      { key: 'test-image', viewportWidth: 400, browser: 'Chrome' },
      { key: 'test-image', viewportWidth: 400, browser: 'Firefox' },
      { key: 'test-image', viewportWidth: 1024, browser: 'Chrome' },
      { key: 'test-image', viewportWidth: 1024, browser: 'Firefox' },
    ].forEach((expectedKey) => {
      expect(
        screenshots.some((screenshot) =>
          isEqual(screenshot.properties, expectedKey),
        ),
      );
    });
  });
});
