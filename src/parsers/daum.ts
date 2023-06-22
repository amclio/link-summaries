import type { Page } from 'puppeteer'

import type {
  ParserReturn as CommonParserReturn,
  ParserParam,
} from './types.js'

interface SearchParam {
  page: Page
  title: string
}

interface ParserReturn extends CommonParserReturn {
  article: string
  system: 'daum'
}

export async function searchArticle({ page, title }: SearchParam) {
  await page.goto(`https://search.daum.net/search?w=news&show_dns=1&q=${title}`)

  const listElement = await page.waitForSelector('.c-list-basic')

  if (!listElement) {
    throw new Error(
      `Daum search wasn't properly performed for the title: ${title}`
    )
  }

  const url = await listElement.evaluate((el) =>
    el.querySelector('.c-item-content a')?.getAttribute('href')
  )

  if (!url) {
    throw new Error(`Daum article wasn't found for the title: ${title}`)
  }

  return url
}

async function getOriginalArticle(page: Page) {
  const articleBlockElement = await page.waitForSelector('.article_view')

  if (!articleBlockElement) {
    throw new Error(`Daum article block isn't available`)
  }

  const articleList = await articleBlockElement?.evaluate((el) =>
    Array.from(el.querySelectorAll('p')).map((queries) => queries.textContent)
  )

  const article = articleList.join(' ')

  return article
}

async function getSummary(page: Page) {
  const exists = await page.evaluate(() =>
    document.querySelector('#digestViewLayer')
  )

  if (!exists) {
    return null
  }

  const summaryBlockElement = await page.waitForSelector('#digestViewLayer', {
    timeout: 1000,
  })

  if (!summaryBlockElement) {
    throw new Error(`Daum summary block isn't available`)
  }

  const summaryList = await summaryBlockElement.evaluate((el) =>
    Array.from(el.querySelectorAll('p')).map((queried) => queried.textContent)
  )

  const summary = summaryList.join(' ').trim()

  return summary
}

export async function parsingDaum({
  page,
  url,
}: ParserParam): Promise<ParserReturn> {
  await page.goto(url)

  const article = await getOriginalArticle(page)
  const summary = await getSummary(page)

  return {
    system: 'daum',
    article,
    summary,
  }
}
