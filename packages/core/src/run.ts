import { Configuration } from './Configuration';
import compareImages from 'resemblejs/compareImages';
import combineAsyncIterators from 'combine-async-iterators';
import { ScreenshotReport } from './Reporter';

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
    ...iterators.map(async function*(iterator, i) {
      for await (const item of iterator) {
        const key = keyGenerator(item);
        buffers[i].set(key, item);

        if (buffers.every(buffer => buffer.has(key))) {
          const items = buffers.map(buffer => {
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
    buffers.flatMap(buffer => Array.from(buffer.keys())),
  );

  for (const key of remainingKeys) {
    const items = buffers.map(buffer => buffer.get(key) || null);

    yield { key, items };
  }
}

export default async function run(configuration: Configuration): Promise<void> {
  const matchings = joinAsyncIterators(
    [configuration.before, configuration.after].map(backend =>
      backend.getScreenshots(),
    ),
    // TODO: Ensure properties are ordered
    item => JSON.stringify(item.key),
  );

  const screenshotReports: ScreenshotReport[] = [];

  for await (const {
    key: serialisedKey,
    items: [beforeScreenshot, afterScreenshot],
  } of matchings) {
    // TODO: Make keys not serialised when doing the join
    const key = JSON.parse(serialisedKey);

    if (beforeScreenshot == null || afterScreenshot == null) {
      screenshotReports.push({
        key,
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
        key,
        mismatchPercentage: Number.parseFloat(diffResult.misMatchPercentage),
        before: beforeScreenshot.image,
        after: afterScreenshot.image,
        diff: diffResult.getBuffer(),
      });
    }
  }

  await Promise.all(
    configuration.reporters.map(reporter =>
      reporter.report({
        screenshots: screenshotReports,
      }),
    ),
  );
}
