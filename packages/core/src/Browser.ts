export interface Browser {
  createSession(): Promise<BrowserSession>;
  name: string;
  viewportWidth: number;
}

/**
 * Represents a stateful instance of a browser - could be a full new browser or a new browser tab.
 */
export interface BrowserSession {
  goTo(url: string): Promise<void>;
  takeScreenshot(): Promise<Buffer>;
  getLinks(): Promise<string[]>;
  getCurrentUrl(): Promise<string>;
  destroy(): Promise<void>;
}
