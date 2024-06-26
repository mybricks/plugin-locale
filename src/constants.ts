export const LOCALE_PLUGIN_NAME = `@mybricks/plugins/locale`
export type TLangItem = {
  id: string,
  content: {
    [langKey: string]: string, // 语种 => 该语种下的文本
  }
}

export interface TLocalePluginData {
  langPackLink: string // 语言包连接
  i18nLangContent: {
    [id: string]: TLangItem
  },
  usedIds: string[],
  loadStats: EnumLoadStats, // 是否在加载中
  errorMsg: string,
  enableFormat: boolean,
  formatFn: string, // 从外部语料包中提取出符合格式的语料
}

export enum EnumLoadStats {
  'loading',
  'unload',
  'loaded',
}

export const loadStatsInfo = {
  [EnumLoadStats.loading]: {
    msg: '加载中',
    color: 'green'
  },
  [EnumLoadStats.unload]: {
    msg: '未加载',
    color: 'red'
  },
  [EnumLoadStats.loaded]: {
    msg: '已加载',
    color: 'green'
  }
}

export const exampleFormatFunc = `(packContentLoaded) => {
/** 返回格式：
{ // 唯一id作为key
  "1": {
    "id": "1",
    "content": {
      "en": "hello",
      "zh": "你好",
      "zh-CN": "你好",
      ... // 其他语言
    }
  },
  ... // 其他语料
}
**/
  return packContentLoaded;
 }
`;

export const CDN = {
  prettier: {
    standalone: '/mfs/editor_assets/prettier/2.6.2/standalone.js',
    babel: '/mfs/editor_assets/prettier/2.6.2/parser-babel.js'
  },
  eslint: '/mfs/editor_assets/eslint/8.15.0/eslint.js',
  paths: {
    vs: '/mfs/editor_assets/monaco-editor/0.33.0/min/vs',
  },
  monacoLoader: '/mfs/editor_assets/monaco-editor/0.33.0/min/vs/loader.min.js'
}