interface UrlWithTopic {
  startCount: number
  topic: string
  urls: string[]
}

export const metadata: UrlWithTopic[] = [
  {
    topic: 'politic',
    urls: [
      'https://n.news.naver.com/mnews/article/001/0013999238?rc=N&ntype=RANKING',
      'https://n.news.naver.com/mnews/article/001/0013999496?rc=N&ntype=RANKING',
      'https://n.news.naver.com/mnews/article/001/0013999367?rc=N&ntype=RANKING',
      'https://n.news.naver.com/mnews/article/001/0013997323?rc=N&ntype=RANKING',
      'https://n.news.naver.com/mnews/article/001/0013997508?rc=N&ntype=RANKING',
      'https://n.news.naver.com/mnews/article/001/0013997407?rc=N&ntype=RANKING',
    ],
    startCount: 13,
  },
  {
    topic: 'social',
    urls: [
      'https://n.news.naver.com/mnews/article/001/0013999822?rc=N&ntype=RANKING',
      'https://n.news.naver.com/mnews/article/001/0013999760?rc=N&ntype=RANKING',
      'https://n.news.naver.com/mnews/article/001/0013999670?rc=N&ntype=RANKING',
      'https://n.news.naver.com/mnews/article/001/0013999479?rc=N&ntype=RANKING',
      'https://n.news.naver.com/mnews/article/001/0013999328?rc=N&ntype=RANKING',
      'https://n.news.naver.com/mnews/article/001/0013999626?rc=N&ntype=RANKING',
      'https://n.news.naver.com/mnews/article/001/0013999402?rc=N&ntype=RANKING',
      'https://n.news.naver.com/mnews/article/001/0013997354?rc=N&ntype=RANKING',
      'https://n.news.naver.com/mnews/article/001/0013997355?rc=N&ntype=RANKING',
      'https://n.news.naver.com/mnews/article/001/0013997427?rc=N&ntype=RANKING',
    ],
    startCount: 13,
  },
  {
    topic: 'economic',
    urls: [
      'https://n.news.naver.com/mnews/article/001/0014000014?rc=N&ntype=RANKING',
      'https://n.news.naver.com/mnews/article/001/0014000036?rc=N&ntype=RANKING',
    ],
    startCount: 4,
  },
  {
    topic: 'world',
    urls: [
      'https://n.news.naver.com/mnews/article/001/0013999820?rc=N&ntype=RANKING',
      'https://n.news.naver.com/mnews/article/001/0013999612?rc=N&ntype=RANKING',
      'https://n.news.naver.com/mnews/article/001/0013997307?rc=N&ntype=RANKING',
    ],
    startCount: 5,
  },
]
