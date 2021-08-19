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
  actions: BrowserActions;
}

/**
 * A set of actions executed in the context of a browser page.
 * Useful for modifying the page before screenshots are taken,
 * for example for making the screenshots deterministic.
 */
export interface BrowserActions {
  clickElements(cssSelector: string): Promise<void>;
  executeScript(script: string): Promise<void>;
}
