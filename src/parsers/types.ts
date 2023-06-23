import type { Page } from 'puppeteer'

export type { Topic } from './chatgpt.js'

export interface ParserParam {
  page: Page
  url: string
}

export interface ParserReturn {
  summary: null | string
  system: string
}
