export const isUrl = (url: string) => /^https?:\/\//.test(url)

export const decodeIfPossible = (str: string) => {
  try {
    return decodeURIComponent(str)
  } catch (e) {
    console.error(`decodeURIComponent fail:`, e)
    return str
  }
}
