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
  onUsedIdChanged?: ({ ids }) => any
  // 默认语言包转换函数，将外部语言包转成内部格式
  defaultTransform?: (loangContent: Object) => Array<{
    id: string,
    content: {
      [lang: string]: string
    }
  }>
  visible?: boolean
}

export default (props: IProps = {} as any) => {
  const { defaultPackLink, onPackLoad, defaultTransform, visible = true, onUsedIdChanged } = props

  const pluginInstance = {
    name: LOCALE_PLUGIN_NAME,
    namespace: LOCALE_PLUGIN_NAME,
    title: '多语言',
    description: '多语言插件',
    data,
    i18nLangContent: {},
    onLoad({ data, locale }) {

      // 参数初始化
      if (data.langPackLink) {
        data.langPackLink = decodeIfPossible(data.langPackLink)
      } else if (defaultPackLink) {
        data.langPackLink = defaultPackLink
      }

      if (data.formatFn) {
        data.formatFn = decodeIfPossible(data.formatFn)
      } {
        data.formatFn = exampleFormatFunc
      }

      // 加载语言包
      this.loadPack(data.langPackLink, data)

      onUsedIdChanged({ ids: data.usedIds })
      // 注册实现方法
      locale?.registerImpl?.({
        searchByKeywords: this.genSearchByKeywords(pluginInstance),
        getById: this.genGetById(pluginInstance),
        usedById: this.genUsedById(data),
        // searchById: this.searchById
      })
    },

    genUsedById: data => (id) => {
      if (typeof id === 'undefined') return false
      if (!Array.isArray(data.usedIds)) {
        data.usedIds = []
      }
      if (data.usedIds.indexOf(id) === -1) {
        data.usedIds = [...data.usedIds, id]
      }


      if (typeof onUsedIdChanged === 'function') {
        onUsedIdChanged({ ids: data.usedIds })
      }
      return true
    },

    async loadPack(link, data: TLocalePluginData) {
      if (!link) return {}

      data.errorMsg = ''
      data.loadStats = EnumLoadStats.unload

      if (!isUrl(link)) {
        data.errorMsg = '请输入正确的url地址'
        return {}
      }

      data.loadStats = EnumLoadStats.loading
      return fetchPack({ link }).then(res => {
        data.loadStats = EnumLoadStats.loaded
        return res
      }).then(res => {
        try {
          if (data.enableFormat || defaultTransform) {
            const contentList = this.transform(res, data)
            if (!Array.isArray(contentList)) {
              throw new Error(`转化函数返回的必须是数组！`)
            }
            pluginInstance.i18nLangContent = contentList.reduce((res, item) => {
              res[item.id] = item
              return res
            }, {})
          } else {
            pluginInstance.i18nLangContent = res
          }

          data.errorMsg = ''
          if (typeof onPackLoad === 'function') {
            onPackLoad({ i18nLangContent: pluginInstance.i18nLangContent })
          }
        } catch (e) {
          console.error(`loadPack error:`, e)
          data.errorMsg = '转换语言包出错'
        }
        return pluginInstance.i18nLangContent
      }).catch(e => {
        data.errorMsg = '加载语言包出错'
        console.error(e)
        data.loadStats = EnumLoadStats.unload
      })
    },

    transform(originData, data) {
      if (data.enableFormat) {
        const { formatFn } = data
        const fn = decodeIfPossible(formatFn)
        return eval(fn)(originData)
      } else {
        return defaultTransform(originData)
      }
    },

    // 语言包的具体内容i18nLangContent，不保存，因为数据量大且是动态加载进来的
    toJSON({ data }) {
      const { langPackLink, formatFn, usedIds } = data
      return {
        langPackLink: encodeURIComponent(langPackLink) !== langPackLink ? encodeURIComponent(langPackLink) : langPackLink,
        formatFn: encodeURIComponent(formatFn) !== formatFn ? encodeURIComponent(formatFn) : formatFn,
        usedIds,
      }
    },

    genGetById: pluginInstance => (id: string) => {
      const res = pluginInstance.i18nLangContent[id] || {}
      return {
        id,
        keyCode: id,
        content: res.content,
        remark: false
      }
    },
    genSearchByKeywords: pluginInstance => (keywords, langType) => {
      if (!pluginInstance.i18nLangContent || typeof pluginInstance.i18nLangContent !== 'object') {
        return []
      }
      return Object.values(pluginInstance.i18nLangContent).filter(item => {
        return item?.content?.['zh']?.indexOf?.(keywords) !== -1
      })?.map?.(res => {
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
            return <Plugin {...args} visible={visible} loadPack={pluginInstance.loadPack.bind(pluginInstance)} />;
          },
        },
      },
    },
  }

  return pluginInstance
}