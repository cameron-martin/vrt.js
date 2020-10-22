import { Configuration } from './Configuration';
import compareImages from 'resemblejs/compareImages';
import combineAsyncIterators from 'combine-async-iterators';
import { Report, ScreenshotReport } from './Report';

interface JoinResult<K, T> {
  key: K;
  items: (T | null)[];
}

/**
 * Joins together elements from different async iterators,
 * even if elements with the same join key arrive out of order.
 *
 * @param iterators
 * @param keyGenerator
 */
async function* joinAsyncIterators<
  T,
  K extends string | number | boolean | symbol
>(
  iterators: AsyncIterableIterator<T>[],
  keyGenerator: (item: T) => K,
): AsyncIterableIterator<JoinResult<K, T>> {
  const buffers = iterators.map(() => new Map<K, T>());

  yield* combineAsyncIterators(
    ...iterators.map(async function* (iterator, i) {
      for await (const item of iterator) {
        const key = keyGenerator(item);
        buffers[i].set(key, item);

        if (buffers.every((buffer) => buffer.has(key))) {
          const items = buffers.map((buffer) => {
            const item = buffer.get(key)!;
            buffer.delete(key);
            return item;
          });

          yield { key, items };
        }
      }
    }),
  );

  const remainingKeys = new Set(
    buffers.flatMap((buffer) => Array.from(buffer.keys())),
  );

  for (const key of remainingKeys) {
    const items = buffers.map((buffer) => buffer.get(key) || null);

    yield { key, items };
  }
}

type Selectors<T, R extends any[]> = { [K in keyof R]: (elem: T) => R[K] };

function createCompare<T, R extends any[]>(
  ...selectors: Selectors<T, R>
): (a: T, b: T) => number {
  return (a, b) => {
    for (let i = 0; i < selectors.length; i++) {
      const aSelected = selectors[i](a);
      const bSelected = selectors[i](b);

      if (aSelected < bSelected) {
        return -1;
      }

      if (aSelected > bSelected) {
        return 1;
      }
    }

    return 0;
  };
}

export default async function run(configuration: Configuration): Promise<void> {
  const matchings = joinAsyncIterators(
    [configuration.before, configuration.after].map((backend) =>
      backend.getScreenshots(),
    ),
    // TODO: Ensure properties are ordered
    (item) => JSON.stringify(item.properties),
  );

  const screenshotReports: ScreenshotReport[] = [];

  for await (const {
    key: serialisedKey,
    items: [beforeScreenshot, afterScreenshot],
  } of matchings) {
    // TODO: Make keys not serialised when doing the join
    const properties = JSON.parse(serialisedKey);

    if (beforeScreenshot == null || afterScreenshot == null) {
      screenshotReports.push({
        properties,
        mismatchPercentage: 100,
        before: beforeScreenshot && beforeScreenshot.image,
        after: afterScreenshot && afterScreenshot.image,
        diff: null,
      });
    } else {
      const diffResult = await compareImages(
        beforeScreenshot.image,
        afterScreenshot.image,
      );

      screenshotReports.push({
        properties,
        mismatchPercentage: Number.parseFloat(diffResult.misMatchPercentage),
        before: beforeScreenshot.image,
        after: afterScreenshot.image,
        diff: diffResult.getBuffer(),
      });
    }
  }

  screenshotReports.sort(
    createCompare(
      (elem) => elem.properties.key,
      (elem) => elem.properties.browser,
      (elem) => elem.properties.viewportWidth,
    ),
  );

  await configuration.report(new Report(screenshotReports));
}
