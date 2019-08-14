import { Configuration } from './core/Configuration';
import { Backend, Screenshot } from './core/Backend';
import PuppeteerBackend from './puppeteer-backend/PuppeteerBackend';

type ArrayValues<T> = { [K in keyof T]: T[K][] };

/**
 * Creates a backend from all combinations of a configuration matrix.
 *
 * @param matrix
 * @param generator
 */
class MatrixBackend<T> implements Backend {
  private readonly backend: CompositeBackend;

  constructor(matrix: ArrayValues<T>, generator: (properties: T) => Backend) {
    this.backend = new CompositeBackend([]);
  }

  getScreenshots(): AsyncIterableIterator<Screenshot> {
    return this.backend.getScreenshots();
  }
}

/**
 * Creates a backend that combines screenshots from multiple backends in parallel.
 */
class CompositeBackend implements Backend {
  constructor(backends: Backend[]) {}

  getScreenshots(): AsyncIterableIterator<Screenshot> {
    throw new Error('Method not implemented.');
  }
}

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
