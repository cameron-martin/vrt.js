import { Browser, BrowserSession } from '@vrt.js/core';
import * as playwright from 'playwright';

interface Config {
  viewportWidth: number;
  product: 'chromium' | 'firefox';
}

export default class PlaywrightBrowser implements Browser {
  readonly name = { chromium: 'Chromium', firefox: 'Firefox' }[
    this.config.product
  ];
  readonly viewportWidth = this.config.viewportWidth;

  constructor(private readonly config: Config) {}

  async createSession(): Promise<BrowserSession> {
    const browser = await playwright[this.config.product].launch();

    return new PlaywrightBrowserSession(
      this.config,
      browser,
      await browser.newPage({
        viewport: { width: this.config.viewportWidth, height: 500 },
      }),
    );
  }
}

export class PlaywrightBrowserSession implements BrowserSession {
  constructor(
    private readonly config: Config,
    private readonly browser: playwright.Browser,
    private readonly page: playwright.Page,
  ) {}

  async goTo(url: string): Promise<void> {
    await this.page.goto(url);
  }

  takeScreenshot(): Promise<Buffer> {
    return this.page.screenshot({ fullPage: true });
  }

  async getLinks(): Promise<string[]> {
    const hrefs = await this.page.$$eval('a', (elements) =>
      elements.map((element) => (element as HTMLAnchorElement).href),
    );

    return hrefs.filter((href) => href != null) as string[];
  }

  getCurrentUrl(): Promise<string> {
    return Promise.resolve(this.page.url());
  }

  destroy(): Promise<void> {
    return this.browser.close();
  }
}
