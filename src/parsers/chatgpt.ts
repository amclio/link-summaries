import { Configuration, OpenAIApi } from 'openai'

import type { ParserReturn } from './types.js'

enum NewsTopic {
  economic = '경제',
  politic = '정치',
  social = '사회',
  world = '국제',
}

export type Topic = keyof typeof NewsTopic

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY ?? '',
})

const openai = new OpenAIApi(config)

const createSystemPrompt = (
  topic: Topic
) => `너는 ${NewsTopic[topic]} 뉴스를 요약하는 도우미야. 다음 국제 뉴스 기사를 그 내용이 잘 드러나도록 3문장 이내로 요약해 줘. 모든 문장은 '~다'와 같이 뉴스 기사와 같은 말투로 끝나야 해.
`

const createPrompt = ({
  article,
  topic,
}: {
  article: string
  topic: Topic
}) => `${createSystemPrompt(topic)}

${article}
`

async function createSummary(params: { article: string; topic: Topic }) {
  const prompt = createPrompt(params)

  const response = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo-16k-0613',
    messages: [{ role: 'user', content: prompt }],
  })

  const summary = response.data.choices[0].message?.content

  return summary
}

export async function parsingChatGPT(params: {
  article: string
  topic: Topic
}): Promise<ParserReturn> {
  const summary = await createSummary(params)

  return { system: 'chatgpt', summary: summary ?? null }
}
