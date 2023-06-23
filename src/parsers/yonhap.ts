import type { Page } from 'puppeteer'

import type {
  ParserReturn as CommonParserReturn,
  ParserParam,
} from './types.js'

interface ParserReturn extends CommonParserReturn {
  system: 'yonhap'
}

async function getSummary({ page }: { page: Page }) {
  const ifExists = await page.evaluate(() =>
    document.querySelector('.story-summary')
  )

  if (!ifExists) return null

  const summaryBlockElements = await page.waitForSelector('.story-summary')

  if (!summaryBlockElements) {
    throw new Error(`Yonhap summary block is not available`)
  }

  const summaryList = await summaryBlockElements.evaluate((el) =>
    Array.from(el.querySelectorAll('p')).map((queried) => queried.textContent)
  )

  return summaryList.join(' ')
}

export async function parsingYonhap({
  page,
  url,
}: ParserParam): Promise<ParserReturn> {
  await page.goto(url)

  const summary = await getSummary({ page })

  return { summary, system: 'yonhap' }
}
