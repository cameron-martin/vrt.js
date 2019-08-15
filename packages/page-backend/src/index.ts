import { Backend, Screenshot, Browser } from '@vrt.js/core';

export interface Config {
  /**
   * The list of urls to capture.
   */
  urls: string[];
  /**
   * Whether new urls are discovered
   */
  discoverUrls?: boolean;
  browser: Browser;
  /**
   * This is removed from the url to create the path.
   */
  prefix: string;
  /**
   * Number of concurrent browser sessions to use.
   * TODO: Implement
   * @default 1
   */
  concurrency?: number;
}

/**
 * A backend that uses a browser to take full page screenshots of pages.
 */
export default class PageBackend implements Backend {
  constructor(private readonly config: Config) {}

  async *getScreenshots(): AsyncIterableIterator<Screenshot> {
    const session = await this.config.browser.createSession();

    try {
      const visitedUrls = new Set<string>();
      const urlQueue = [...this.config.urls];

      while (urlQueue.length !== 0) {
        const url = urlQueue.pop()!;
        visitedUrls.add(url);

        await session.goTo(url);

        const path = removePrefix(
          this.config.prefix,
          await session.getCurrentUrl(),
        );

        yield {
          key: {
            path,
          },
          image: await session.takeScreenshot(),
        };

        if (this.config.discoverUrls) {
          const newUrls = (await session.getLinks()).filter(
            link => !visitedUrls.has(link),
          );

          urlQueue.unshift(...newUrls);
        }
      }
    } finally {
      await session.destroy();
    }
  }
}

const removePrefix = (prefix: string, str: string) => {
  if (!str.startsWith(prefix)) {
    throw new Error(`Cannot remove prefix ${prefix} from string ${str}.`);
  }

  return str.slice(prefix.length);
};
