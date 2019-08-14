import { Backend, Screenshot } from './Backend';
import combineAsyncIterators from 'combine-async-iterators';

type ArrayValues<T> = { [K in keyof T]: T[K][] };

/**
 * Creates a backend from all combinations of a configuration matrix.
 *
 * @param matrix
 * @param generator
 */
export class MatrixBackend<T> implements Backend {
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
export class CompositeBackend implements Backend {
  constructor(private readonly backends: Backend[]) {}

  getScreenshots(): AsyncIterableIterator<Screenshot> {
    return combineAsyncIterators(
      ...this.backends.map(backend => backend.getScreenshots()),
    );
  }
}
