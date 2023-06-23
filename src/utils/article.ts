export const removeComments = (text: string) =>
  text
    .replace('▶제보는 카톡 okjebo', '')
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gm, '')
    .replace(/^.*=/gm, '')
    .trim()
