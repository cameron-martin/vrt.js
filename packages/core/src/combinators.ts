import { Backend, Screenshot } from './Backend';
import combineAsyncIterators from 'combine-async-iterators';

type ArrayValues<T> = { [K in keyof T]: T[K][] };

function objectCombinations<T>(matrix: ArrayValues<T>): T[] {
  const keys = Object.keys(matrix) as (keyof T)[];

  if (keys.length === 0) return [{} as any];

  const headKey = keys[0];

  const { [headKey]: headValues, ...rest } = matrix;

  const restCombinations: any[] = objectCombinations(rest as any);

  return headValues.flatMap((headValue) =>
    restCombinations.map((x) => ({ [headKey]: headValue, ...x })),
  );
}

/**
 * Creates a backend from all combinations of a configuration matrix.
 *
 * @param matrix
 * @param generator
 */
export class MatrixBackend<T> implements Backend {
  private readonly backend: CompositeBackend;

  constructor(matrix: ArrayValues<T>, generator: (properties: T) => Backend) {
    const combinations = objectCombinations(matrix);

    this.backend = new CompositeBackend(
      combinations.map((combination) => generator(combination)),
    );
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
      ...this.backends.map((backend) => backend.getScreenshots()),
    );
  }
}
