import { readdir } from 'fs/promises'

const ARTICLE_PATH = 'articles'

const parseFilename = (filename: string) => filename.match(/(\w+)-(\w+)\.txt/)

async function launch() {
  const summaryFiles = await readdir(`${ARTICLE_PATH}/summaries`)

  const summaries = summaryFiles
    .map((filename) => parseFilename(filename))
    .filter((match): match is Exclude<ReturnType<typeof parseFilename>, null> =>
      Boolean(match)
    )
    .map(([, topic, system]) => ({
      topic,
      system,
    }))

  const topics = [...new Set(summaries.map((summary) => summary.topic))]
  const systems = [...new Set(summaries.map((summary) => summary.system))]

  const completeTopicSets = topics.filter(
    (topic) =>
      summaries.filter((summary) => summary.topic === topic).length ===
      systems.length
  )

  console.log('Complete Summary Sets Count:', completeTopicSets.length)
}

launch()
