import { isEqual } from 'lodash';
import {
  MockBackend,
  getExampleScreenshot,
  asyncIterableToArray,
} from '../../test-utils';
import { Screenshot } from '../Backend';
import { CompositeBackend } from '../combinators';

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
  it.todo('yields items from backends of all combinations of matrix');
});
