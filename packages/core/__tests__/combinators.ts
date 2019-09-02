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
        key: { browser: 'chrome', id: '1' },
        image: await getExampleScreenshot('screenshot1.png'),
      },
      {
        key: { browser: 'chrome', id: '2' },
        image: await getExampleScreenshot('screenshot2.png'),
      },
    ];

    const firefoxScreenshots: Screenshot[] = [
      {
        key: { browser: 'firefox', id: '1' },
        image: await getExampleScreenshot('screenshot1.png'),
      },
      {
        key: { browser: 'firefox', id: '2' },
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
        inputScreenshots.some(inputScreenshot =>
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
      { screenWidth: [400, 1024], browser: ['Chrome', 'Firefox'] },
      ({ screenWidth, browser }) =>
        new MockBackend([{ key: { screenWidth, browser }, image }]),
    );

    const screenshots = await asyncIterableToArray(backend.getScreenshots());

    expect(screenshots.length).toBe(4);
    [
      { screenWidth: 400, browser: 'Chrome' },
      { screenWidth: 400, browser: 'Firefox' },
      { screenWidth: 1024, browser: 'Chrome' },
      { screenWidth: 1024, browser: 'Firefox' },
    ].forEach(expectedKey => {
      expect(
        screenshots.some(screenshot => isEqual(screenshot.key, expectedKey)),
      );
    });
  });
});
