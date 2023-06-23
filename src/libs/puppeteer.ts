import type { Browser } from 'puppeteer'

import puppeteer from 'puppeteer'

export class PuppeteerInstance {
  private browser?: Browser

  async createBrowser() {
    const browser = await puppeteer.launch({ headless: 'new' })
    // const browser = await puppeteer.launch({ headless: false })
    this.browser = browser

    return browser
  }

  getBrowser() {
    return this.browser
  }
}
