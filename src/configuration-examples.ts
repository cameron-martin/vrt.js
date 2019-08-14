import { Configuration } from './core/Configuration';
import PuppeteerBackend from './puppeteer-backend/PuppeteerBackend';
import { MatrixBackend } from './core/combinators';

const config1: Configuration = {
  before: new PuppeteerBackend({
    screenWidth: 1024,
    urls: [],
  }),
  after: new MatrixBackend(
    { screenWidth: [400, 1024, 1280] },
    ({ screenWidth }) =>
      new PuppeteerBackend({
        screenWidth,
        urls: [],
      }),
  ),
  reporters: [],
};
