import React, { useCallback, useEffect, useState } from 'react'
import Editor from '@mybricks/code-editor';
import style from './index.less'
import { importIcon } from '../icon'
import { CDN, EnumLoadStats, TLocalePluginData, exampleFormatFunc, loadStatsInfo } from '../constants'
import { isUrl } from '../utils'
import Switch from './components/Switch'

interface Props {
  data: TLocalePluginData,
  visible: boolean,
  loadPack: (string, TLocalePluginData) => Promise<any>,
}

export default ({ data, loadPack, visible = true }: Props = {} as any) => {

  const onLoadPackl = useCallback((e) => {
    if (e.target.value === data.langPackLink) return
    data.langPackLink = e.target.value
    loadPack(data.langPackLink, data)
  }, [])

  return <div className={style.sidebarPanel}>
    <div className={style.header}>
      <span>多语言</span>
    </div>
    <div style={{ display: visible ? 'block' : 'none' }}>
      <div className={style.title}>
        <span>语言包地址</span>
        <span className={style.stats} style={{
          display: data.langPackLink !== '' ? 'inline-block' : 'none',
          backgroundColor: loadStatsInfo[data.loadStats]?.color
        }}>{loadStatsInfo[data.loadStats]?.msg}</span>
      </div>
      <div className={style.search}>
        <input
          defaultValue={data.langPackLink}
          data-mybricks-tip={data.langPackLink}
          placeholder={'请输入语言包地址'}
          onBlur={onLoadPackl}
        />
        {/* <div className={style.icon} data-mybricks-tip='加载语言包' onClick={onImport}>
        {importIcon}
      </div> */}
      </div>
      <div className={style.error}>{data.errorMsg}</div>

      <div style={{
        marginTop: '20px'
      }}>
        <div className={style.formatCtr}>
          <div className={style.title}>格式化语言包</div>
          <Switch defaultChecked={data.enableFormat} onChange={(checked) => data.enableFormat = checked} />
        </div>
        <div style={{
          display: data.enableFormat ? 'block' : 'none',
        }}>
          <Editor
            width='100%'
            height={400}
            language='javascript'
            theme='light'
            lineNumbers='off'
            /** @ts-ignore */
            scrollbar={{
              horizontalScrollbarSize: 2,
              verticalScrollbarSize: 2,
            }}
            CDN={CDN}
            value={decodeURIComponent(data.formatFn) || exampleFormatFunc}
            onBlur={e => {
              const value = e.getValue();
              if (data.formatFn !== decodeURIComponent(value)) {
                data.formatFn = decodeURIComponent(value);
              }
              loadPack(data.langPackLink, data)
            }}
            env={{
              isNode: false,
              isElectronRenderer: false,
            }}
            minimap={{ enabled: false }}
          />
        </div>
      </div>
    </div>
  </div>
}