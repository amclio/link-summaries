import type { Page } from 'puppeteer'

import type {
  ParserReturn as CommonParserReturn,
  ParserParam,
} from './types.js'

interface ParserReturn extends CommonParserReturn {
  system: 'yonhap'
}

export async function parsingYonhap({
  page,
  url,
}: ParserParam): Promise<ParserReturn> {
  await page.goto(url)

  const summaryBlockElements = await page.waitForSelector('.story-summary')

  if (!summaryBlockElements) {
    throw new Error(`Yonhap summary block is not available for the url ${url}`)
  }

  const summaryList = await summaryBlockElements.evaluate((el) =>
    Array.from(el.querySelectorAll('p')).map((queried) => queried.textContent)
  )

  return { summary: summaryList.join(' '), system: 'yonhap' }
}
