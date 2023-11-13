import { fetchPack } from "./api"
import { EnumLoadStats, exampleFormatFunc, LOCALE_PLUGIN_NAME, TLocalePluginData } from "./constants"
import data from './data'
import { pluginIcon } from './icon'
import Plugin from './Plugin'
import { decodeIfPossible, isUrl } from "./utils"

export { LOCALE_PLUGIN_NAME } from './constants'

interface IProps {
  defaultPackLink?: string,
  onPackLoad?: ({ i18nLangContent }) => any
}

export default ({ defaultPackLink, onPackLoad }: IProps) => {
  const pluginInstance = {
    name: LOCALE_PLUGIN_NAME,
    namespace: LOCALE_PLUGIN_NAME,
    title: '多语言',
    description: '多语言插件',
    data,

    // 获取当前语言包数据
    getI18nLangContent() {
      return this.data.i18nLangContent || {}
    },

    onLoad({ data, locale }) {

      // 参数初始化
      if (data.langPackLink) {
        data.langPackLink = decodeIfPossible(data.langPackLink)
      }
      if (data.formatFn) {
        data.formatFn = decodeIfPossible(data.formatFn)
      } else {
        data.formatFn = exampleFormatFunc
      }

      // 加载语言包
      this.loadPack(data.langPackLink, data)

      // 注册实现方法
      locale?.registerImpl?.({
        searchByKeywords: this.genSearchByKeywords(data),
        getById: this.genGetById(data),
        // searchById: this.searchById
      })
    },

    async loadPack(link, data: TLocalePluginData) {
      if (!link) return

      data.errorMsg = ''
      data.i18nLangContent = {}
      data.loadStats = EnumLoadStats.unload

      if (!isUrl(link)) {
        data.errorMsg = '请输入正确的url地址'
        return
      }

      data.loadStats = EnumLoadStats.loading
      fetchPack({ link }).then(res => {
        data.loadStats = EnumLoadStats.loaded
        return res
      }).then(res => {
        try {
          if (data.enableFormat) {
            const contentList = this.transform(res, data)
            data.i18nLangContent = contentList.reduce((res, item) => {
              res[item.id] = item
              return res
            }, {})
          }

          if (typeof onPackLoad === 'function') {
            onPackLoad({ i18nLangContent: data.i18nLangContent })
          }
        } catch (e) {
          data.errorMsg = '转换语言包出错'
        }
      }).catch(e => {
        data.errorMsg = '加载语言包出错'
        console.error(e)
        data.loadStats = EnumLoadStats.unload
      })
    },

    transform(originData, data) {
      const { formatFn } = data
      const fn = decodeIfPossible(formatFn)

      return eval(fn)(originData)
    },

    // 语言包的具体内容i18nLangContent，不保存，因为数据量大且是动态加载进来的
    toJSON({ data }) {
      const { langPackLink, formatFn } = data
      return {
        langPackLink: encodeURIComponent(langPackLink) !== langPackLink ? encodeURIComponent(langPackLink) : langPackLink,
        formatFn: encodeURIComponent(formatFn) !== formatFn ? encodeURIComponent(formatFn) : formatFn,
      }
    },

    // searchById: (id: string) => {
    //   const res = data.i18nLangContent[id] || {}
    //   return {
    //     getContent: (lang) => {
    //       return res[lang] || res['zh'] || ''
    //     }
    //   }
    // },
    genGetById: data => (id: string) => {
      const res = data.i18nLangContent[id] || {}
      return {
        id,
        keyCode: id,
        content: res.content,
        remark: false
      }
    },
    genSearchByKeywords: data => (keywords, langType) => {
      if (!data.i18nLangContent || typeof data.i18nLangContent !== 'object') {
        return []
      }
      return Object.values(data.i18nLangContent).filter(item => {
        return item?.content?.['zh'].indexOf(keywords) !== -1
      }).map(res => {
        const { id, content } = res || {}
        return {
          id,
          keyCode: id,
          content: res.content,
          remark: false
        }
      })
    },

    contributes: {
      sliderView: {
        tab: {
          title: '国际化',
          icon: pluginIcon,
          apiSet: ['locale'],
          render: (args: any) => {
            // @ts-ignore
            return <Plugin {...args} loadPack={pluginInstance.loadPack.bind(pluginInstance)} />;
          },
        },
      },
    },
  }

  return pluginInstance
}