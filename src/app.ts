import type { Page } from 'puppeteer'

import { writeFile } from 'fs/promises'
import Gauge from 'gauge'
import PQueue from 'p-queue'

import { metadata } from '../configs.js'
import { PuppeteerInstance } from './libs/puppeteer.js'
import {
  parsingDaum as parsingDaumWithoutUrl,
  searchArticle as searchDaumArticle,
} from './parsers/daum.js'
import { parsingNaver } from './parsers/naver.js'
import { parsingYonhap } from './parsers/yonhap.js'

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

async function parse({ page, url }: ParserParam) {
  const { originalArticleUrl, title, ...naverSummary } = await parsingNaver({
    url,
    page,
  })

  const yonhapSummary = await parsingYonhap({
    url: originalArticleUrl,
    page,
  })

  const { article, ...daumSummary } = await parsingDaum({ page, title })

  return [
    { system: 'source', summary: article },
    naverSummary,
    yonhapSummary,
    daumSummary,
  ]
}

async function save({ filename, data }: { data: string; filename: string }) {
  await writeFile(filename, data)
}

async function parseAndSave(
  params: ParserParam & { index: number; topic: string }
) {
  const { index, topic, ...parsingParams } = params
  const summaries = await parse(parsingParams)

  await Promise.all(
    summaries.map(({ system, summary }) => {
      if (!summary) {
        return
      }

      save({
        filename:
          system === 'source'
            ? `${SAVING_PATH}/sources/${topic}${index}.txt`
            : `${SAVING_PATH}/summaries/${topic}${index}-${system}.txt`,
        data: summary,
      })
    })
  )
}

async function launch() {
  const instance = new PuppeteerInstance()
  const browser = await instance.createBrowser()
  const urlCount = metadata.reduce((prev, curr) => prev + curr.urls.length, 0)

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
