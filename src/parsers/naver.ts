import type { Page } from 'puppeteer'

import retry from 'async-retry'

import type {
  ParserReturn as CommonParserReturn,
  ParserParam,
} from './types.js'

interface ParserReturn extends CommonParserReturn {
  originalArticleUrl: string
  system: 'naver'
  title: string
}

async function getSummary(page: Page) {
  const exists = await page.evaluate(() =>
    document.querySelector('._SUMMARY_BTN')
  )

  if (!exists) {
    return null
  }

  const summaryButtonElement = await page.waitForSelector('._SUMMARY_BTN')
  const summaryArticleElement = await page.waitForSelector(
    '._SUMMARY_CONTENT_BODY'
  )

  await retry(() =>
    Promise.all([
      summaryButtonElement?.click(),
      page.waitForResponse(
        (res) => res.url().includes('https://tts.news.naver.com'),
        { timeout: 3000 }
      ),
    ])
  )

  const summary = await summaryArticleElement?.evaluate((el) => {
    let walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
    let node: Node | null
    let text = ''

    while ((node = walker.nextNode())) {
      if (!node.parentNode) {
        return text
      }

      let parentTagName =
        node.parentNode instanceof Element
          ? node.parentNode.tagName.toLowerCase()
          : ''
      if (parentTagName !== 'strong') {
        text += `${node.textContent} `
      }
    }
    return text
  })

  return summary || null
}

export async function parsingNaver({
  page,
  url,
}: ParserParam): Promise<ParserReturn> {
  await page.goto(url)

  const titleElement = await page.waitForSelector('#title_area')
  const originalArticleLinkButton = await page.waitForSelector(
    '.media_end_head_origin_link'
  )

  const title = await titleElement?.evaluate((el) => el.textContent)

  const originalArticleUrl = await originalArticleLinkButton?.evaluate((el) =>
    el.getAttribute('href')
  )

  const summary = await getSummary(page)

  if (!title) {
    throw new Error(`Title for give url ${url} is unavailable.`)
  }

  if (!originalArticleUrl) {
    throw new Error(`Original link for give url ${url} is unavailable.`)
  }

  return { title, summary, originalArticleUrl, system: 'naver' }
}
