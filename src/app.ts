import type { Page } from 'puppeteer'

import { existsSync } from 'fs'
import { writeFile } from 'fs/promises'
import Gauge from 'gauge'
import PQueue from 'p-queue'

import type { Topic as NewsTopic } from './parsers/types.js'

import { metadata } from '../configs.js'
import { PuppeteerInstance } from './libs/puppeteer.js'
import { parsingChatGPT } from './parsers/chatgpt.js'
import {
  parsingDaum as parsingDaumWithoutUrl,
  searchArticle as searchDaumArticle,
} from './parsers/daum.js'
import { parsingNaver } from './parsers/naver.js'
import { parsingYonhap } from './parsers/yonhap.js'
import { removeComments } from './utils/article.js'

const SKIP_IF_FILE_EXISTS = true

interface ParserParam {
  page: Page
  url: string
}

const SAVING_PATH = 'articles'

const progress = new Gauge()
const queue = new PQueue({ concurrency: 1 })

async function parsingDaum({ title, page }: { page: Page; title: string }) {
  const daumUrl = await searchDaumArticle({ title, page })
  return await parsingDaumWithoutUrl({
    page,
    url: daumUrl,
  })
}

async function parse({ page, url, topic }: ParserParam & { topic: NewsTopic }) {
  const { originalArticleUrl, title, ...naverSummary } = await parsingNaver({
    url,
    page,
  })

  const yonhapSummary = await parsingYonhap({
    url: originalArticleUrl,
    page,
  })

  const { article, ...daumSummary } = await parsingDaum({ page, title })

  const chatgptSummary = await parsingChatGPT({ article, topic })

  return [
    { system: 'source', summary: removeComments(article) },
    naverSummary,
    yonhapSummary,
    daumSummary,
    chatgptSummary,
  ]
}

async function save({ filename, data }: { data: string; filename: string }) {
  await writeFile(filename, data)
}

const checkIfFileExists = (filename: string): Promise<boolean> =>
  new Promise((resolve) => {
    resolve(existsSync(filename))
  })

async function parseAndSave(
  params: ParserParam & { index: number; topic: NewsTopic }
) {
  const { index, topic, page, url } = params

  const sourceFilePath = `${SAVING_PATH}/sources/${topic}${index}.txt`
  const ifExists = await checkIfFileExists(sourceFilePath)

  if (ifExists && SKIP_IF_FILE_EXISTS) return

  const summaries = await parse({ topic, page, url })

  await Promise.all(
    summaries.map(async ({ system, summary }) => {
      if (!summary) {
        return
      }

      const filename =
        system === 'source'
          ? sourceFilePath
          : `${SAVING_PATH}/summaries/${topic}${index}-${system}.txt`

      await save({
        filename,
        data: summary,
      })
    })
  )
}

async function launch() {
  const instance = new PuppeteerInstance()
  const browser = await instance.createBrowser()
  const urlCount = metadata.reduce((prev, curr) => prev + curr.urls.length, 0)
  console.log('Total articles: ', urlCount)

  setInterval(function () {
    progress.pulse()
  }, 110)

  queue.on('active', () => {
    progress.show(
      `Parsing contents ${urlCount - queue.size} of ${urlCount}...`,
      (urlCount - queue.size) / urlCount
    )
  })

  metadata.forEach(({ startCount, topic, urls }) => {
    const funcs = urls.map((url, idx) => async () => {
      const page = await browser.newPage()

      await parseAndSave({ page, url, index: idx + startCount, topic })

      await page.close()
    })

    queue.addAll(funcs)
  })

  await queue.onEmpty()
  console.log('Done! Exiting...')

  process.exit(0)
}

launch()
