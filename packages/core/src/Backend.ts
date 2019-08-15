/**
 * Used to match screenshots. A set of key-value pairs describing the properties of the image,
 * e.g. the URL that it came from, the screen size, etc.
 */
export type ScreenshotKey = Record<string, string>;

export interface Screenshot {
  key: ScreenshotKey;
  image: Buffer;
}

export interface Backend {
  getScreenshots(): AsyncIterableIterator<Screenshot>;
}
