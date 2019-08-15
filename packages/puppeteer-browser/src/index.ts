import { Browser, BrowserSession } from '@vrt.js/core';
import puppeteer from 'puppeteer';

interface Config {
  screenWidth: number;
}

export default class PuppeteerBrowser implements Browser {
  constructor(private readonly config: Config) {}

  async createSession(): Promise<BrowserSession> {
    const browser = await puppeteer.launch();

    return new PuppeteerBrowserSession(browser, await browser.newPage());
  }
}

export class PuppeteerBrowserSession implements BrowserSession {
  constructor(
    private readonly browser: puppeteer.Browser,
    private readonly page: puppeteer.Page,
  ) {}

  async goTo(url: string): Promise<void> {
    await this.page.goto(url);
  }

  takeScreenshot(): Promise<Buffer> {
    return this.page.screenshot({ fullPage: true });
  }

  async getLinks(): Promise<string[]> {
    const hrefs = await this.page.$$eval('a', elements =>
      elements.map(element => element.getAttribute('href')),
    );

    return hrefs.filter(href => href != null) as string[];
  }

  getCurrentUrl(): Promise<string> {
    return Promise.resolve(this.page.url());
  }

  destroy(): Promise<void> {
    return this.browser.close();
  }
}
