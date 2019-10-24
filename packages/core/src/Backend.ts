/**
 * Used to match screenshots. A set of key-value pairs describing the properties of the image,
 * e.g. the URL that it came from, the screen size, etc.
 */
export interface ScreenshotProperties {
  /**
   * A URL, component name, etc
   */
  key: string;
  browser: string;
  viewportWidth: number;
}

export interface Screenshot {
  properties: ScreenshotProperties;
  image: Buffer;
}

export interface Backend {
  getScreenshots(): AsyncIterableIterator<Screenshot>;
}
