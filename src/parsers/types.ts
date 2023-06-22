import type { Page } from 'puppeteer'

export interface ParserParam {
  page: Page
  url: string
}

export interface ParserReturn {
  summary: null | string
  system: string
}
