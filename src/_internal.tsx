import { Toast, Uploader } from '@fruits-chain/react-native-xiaoshu'
import type { ToastMethods } from '@fruits-chain/react-native-xiaoshu/lib/typescript/toast/interface'
import type { RegularCount } from '@fruits-chain/react-native-xiaoshu/lib/typescript/uploader/interface'
import { isDef, isPromise } from '@fruits-chain/utils'
import cloneDeep from 'lodash/cloneDeep'
import isBoolean from 'lodash/isBoolean'
import type { ForwardRefRenderFunction, PropsWithChildren } from 'react'
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'

import type {
  CustomPreview,
  PreviewInstance,
} from './components/preview/Preview'
import Preview from './components/preview/Preview'
import useUploadResume from './hooks/useUploadResume'
import type {
  CropMediaType,
  FileVO,
  IUploadTempSource,
  PickerType,
  PrintWaterMarkFn,
  UploadItem,
} from './interface'
import type { BasicUploadOptions } from './picker'
import { composedPicker } from './picker'
import type { WatermarkOperations } from './utils'
import { exec } from './utils'

import type { ISource } from '.'
interface OverrideUploadConfig {
  pickerType: PickerType
  cropMediaType?: CropMediaType
  multiple?: boolean
  index?: number
}

export interface UploadInstance {
  open: (config?: OverrideUploadConfig) => void
}

export interface UploadActionParams {
  data: FormData
  file: IUploadTempSource
  resume: boolean
}

export type UploadAction = ({
  data,
  file,
}: UploadActionParams) => Promise<FileVO>

export interface UploadProps {
  list?: UploadItem[]
  defaultList?: UploadItem[]
  /**
   * @description onChange在异步过程中被多次调用，如果onChange有props或依赖，需要注意，见：https://overreacted.io/zh-hans/a-complete-guide-to-useeffect/
   */
  onChange?: (list: UploadItem[]) => void
  /**
   * 上传出错时的回调
   */
  onUploadError?: (msg?: any) => void
  /**
   * 最大上传数量
   */
  maxCount?: number
  /**
   * 上传可点击组件文本
   */
  tipText?: string
  /**
   * 是否进行裁剪
   */
  cropping?: boolean
  /**
   * 是否支持多选上传
   */
  multiple?: boolean
  /**
   * 点击新增，regular模式下点击的索引
   * @param index
   * @returns
   */
  onPressAdd?: (index?: number) => void
  /**
   * 上传地址（需要封装成UploadAction的形式）
   */
  uploadAction: UploadAction
  /**
   * cropping模式下选取图片的宽度（默认300）
   */
  width?: number
  /**
   * cropping模式下选取图片的高度（默认300）
   */
  height?: number
  /**
   * 是否支持续传（false: 不使用 true: 任何情况下都是用 number: 只有压缩后大于number MB的文件才使用）
   */
  allowResume?: boolean | number
  /**
   * 获取上传当前图片上传进度动作
   */
  progressAction?: (fileHash: string) => Promise<{
    fileUrl: string
    size: number
  }>
  /**
   * 是否开启压缩
   */
  compress?: boolean
  /**
   * 是否显示UI
   */
  showUi?: boolean
  /**
   * 每行显示的图片数 default: 4
   */
  imagesPerRow?: number
  /**
   * regular模式下，设置固定上传个数及文案
   */
  count?: number | RegularCount[]
  /**
   * 自定义预览实现 key: 文件名后缀 value:自定义预览组件
   */
  customPreview?: CustomPreview
  /**
   * 选择器类型
   */
  pickerType?: PickerType | PickerType[]
  /**
   * pickerType 为cropPickerMediaType mediaType
   */
  cropPickerMediaType?: CropMediaType
  /**
   * 用于VisionCamera的标题
   */
  title?: string
  /**
   * 照片水印（支持文本和图片 支持异步获取）
   */
  watermark?: WatermarkOperations
  /**
   * 是否支持后台上传
   * true 支持, 选择文件或者点击重传后不会触发上传API，具体的上传调度逻辑由外部自行实现
   * false 不支持
   */
  backUpload?: boolean
  /**
   * 是否绘制水印 默认`true`
   */
  shouldPrintWatermark?: boolean | PrintWaterMarkFn
  /**
   * 资源删除前执行的钩子函数，返回false停止删除过程 返回`UploadItem[]`作为自定义删除结果直接使用 支持异步
   * @param current
   * @param index
   * @param list
   * @returns
   */
  beforeDelete?: (
    current: UploadItem,
    index: number,
    list: UploadItem[],
  ) => UploadItem[] | boolean | Promise<UploadItem[] | boolean>
}

let toastKey: ToastMethods

/**
 * internal upload component, do not use it!
 * @private
 */
const _UploadInternal: ForwardRefRenderFunction<UploadInstance, UploadProps> = (
  {
    list,
    onChange,
    onUploadError,
    maxCount = 10,
    tipText,
    cropping = false,
    defaultList = [],
    onPressAdd,
    uploadAction,
    width = 300,
    height = 300,
    allowResume = false,
    progressAction,
    compress = true,
    showUi = true,
    imagesPerRow = 4,
    multiple = true,
    count,
    customPreview,
    title,
    watermark = [],
    backUpload = false,
    shouldPrintWatermark = true,
    beforeDelete,
  },
  ref,
) => {
  const previewRef = useRef<PreviewInstance>()
  const { getFileBeforeUpload, uploadFile } = useUploadResume({
    uploadAction,
    progressAction,
    allowResume,
  })
  const [value, setValue] = useState<UploadItem[]>(
    typeof list === 'undefined' ? defaultList : list,
  )
  const valueCopy = useRef<UploadItem[]>([]) // 组件内资源备份
  // 对外暴露接口
  useImperativeHandle(ref, () => ({
    open: chooseResourceAndUpload,
  }))
  // 受控情形下的内外数据同步
  useEffect(() => {
    if (typeof list !== 'undefined') {
      setValue(list)
      valueCopy.current = list
    }
  }, [list])
  // 受控模式下不再设置内部value
  function setValueIfNeeded(_value: UploadItem[]) {
    if (typeof list === 'undefined') {
      setValue(cloneDeep(_value))
    }
  }
  function removeImage(item: UploadItem) {
    const targetIndex = valueCopy.current.findIndex(it => it?.key === item.key)
    let results = [...valueCopy.current]
    if (isDef(count)) {
      results[targetIndex] = null
    } else {
      results.splice(targetIndex, 1)
    }
    valueCopy.current = results
    setValueIfNeeded(results)
    onChange && onChange(results)
  }
  /**
   * 删除文件
   * @param item
   */
  function handleDelete(item: UploadItem, index: number, _list: UploadItem[]) {
    const res = beforeDelete?.(item, index, _list)
    // 1. 如果没有传入beforeDelete，则直接执行默认的delete操作
    if (!isDef(res)) {
      removeImage(item)
      return
    }
    // 2. 如果是异步函数
    if (isPromise(res)) {
      res.then(val => {
        // 2.1 如果===true，则表示执行默认delete操作
        if (isBoolean(val)) {
          if (val) {
            removeImage(item)
          }
          return
        }
        // 2.2 否则以执行结果作为最终值
        valueCopy.current = val
        setValueIfNeeded(val)
        onChange && onChange(val)
      })
    } else {
      // 3.1 同步的情况 如果===true 执行默认delete操作
      if (isBoolean(res)) {
        if (res) {
          removeImage(item)
        }
        return
      }
      // 3.2 把执行结果作为最终值
      valueCopy.current = res
      setValueIfNeeded(res)
      onChange && onChange(res)
    }
  }
  /**
   * 文件选择
   * @param config
   * @returns
   */
  async function chooseResourceAndUpload(config: OverrideUploadConfig) {
    try {
      const action = composedPicker[config.pickerType]
      const options: BasicUploadOptions = {
        multiple: isDef(config.multiple) ? config.multiple : multiple,
        maxCount,
        width,
        height,
        cropping,
        cropMediaType: config.cropMediaType,
        currentCount: value.length,
        title,
        compress,
        onStartCompress() {
          toastKey = Toast.loading({
            message: '处理中...',
            duration: 0,
          })
        },
        watermark,
        shouldPrintWatermark,
      }
      const files = await action(options)
      const filesResumed = await Promise.all(
        files.map(item => getFileBeforeUpload(item)),
      )
      setTimeout(() => {
        toastKey?.close?.()
      }, 0)
      const nextVal = [...value]
      if (filesResumed.length === 1 && isDef(config.index)) {
        nextVal[config.index] = filesResumed[0]
      } else {
        nextVal.push(...filesResumed)
      }
      valueCopy.current = nextVal
      if (!backUpload) {
        setValueIfNeeded(valueCopy.current)
        exec(onChange, cloneDeep(valueCopy.current))
      }
      const filesToUpload = valueCopy.current.filter(
        f => f?.status === 'loading',
      )
      for (const file of filesToUpload) {
        const uploadRes = await uploadFile(file, backUpload)
        if (uploadRes.status === 'error') {
          exec(onUploadError, '文件上传失败')
        }
        const idx = valueCopy.current.findIndex(
          _file => _file?.key === uploadRes.key,
        )
        if (~idx) {
          valueCopy.current[idx] = uploadRes
        }
        if (!backUpload) {
          setValueIfNeeded(valueCopy.current)
          exec(onChange, cloneDeep(valueCopy.current))
        }
      }
      if (backUpload) {
        setValueIfNeeded(valueCopy.current)
        exec(onChange, cloneDeep(valueCopy.current))
      }
    } catch (e) {
      const cancelledCode = ['DOCUMENT_PICKER_CANCELED', 'E_PICKER_CANCELLED']
      // 用户手动取消提示错误
      if (e?.code && cancelledCode.includes(e.code)) {
        return
      }
      // 关闭处理中提示框，如果有必要的话
      toastKey?.close?.()
      Toast(e.message || '文件上传失败！')
    }
  }
  /**
   * 点击上传UI
   * @returns
   */
  function handlePressAdd(index?: number) {
    if (value.length >= maxCount) {
      Toast('已达到最大上传数量！')
      return
    }
    onPressAdd(index)
  }
  /**
   * 点击已上传文件预览
   * @param item
   */
  function handlePress(item: ISource) {
    if (item.status === 'done') {
      previewRef.current.preview(item)
    }
  }
  /**
   * 失败重传
   * @param item
   * @returns
   */
  async function handleReupload(item: ISource) {
    const currIndex = valueCopy.current.findIndex(one => one.key === item.key)
    if (!~currIndex) {
      return
    }
    const res = await getFileBeforeUpload({
      uri: valueCopy.current[currIndex].uri,
      name: '',
      type: valueCopy.current[currIndex].type,
    })
    valueCopy.current[currIndex] = res
    if (!backUpload) {
      setValueIfNeeded(valueCopy.current)
      exec(onChange, cloneDeep(valueCopy.current))
    }
    if (res.status === 'done') {
      if (backUpload) {
        setValueIfNeeded(valueCopy.current)
        exec(onChange, cloneDeep(valueCopy.current))
      }
      return
    }
    const uploadRes = await uploadFile(res, backUpload)
    if (uploadRes.status === 'error') {
      exec(onUploadError, '文件上传失败')
    }
    valueCopy.current[currIndex] = uploadRes
    setValueIfNeeded(valueCopy.current)
    exec(onChange, cloneDeep(valueCopy.current))
  }
  return showUi ? (
    <>
      {typeof count === 'undefined' ? (
        <Uploader
          onPressImage={handlePress}
          maxCount={maxCount}
          onPressDelete={handleDelete}
          onPressUpload={handlePressAdd}
          onPressError={handleReupload}
          list={value}
          uploadText={tipText}
          colCount={imagesPerRow}
        />
      ) : (
        <Uploader.Regular
          onPressImage={handlePress}
          count={count}
          onPressDelete={handleDelete}
          onPressUpload={handlePressAdd}
          onPressError={handleReupload}
          list={value}
          colCount={imagesPerRow}
        />
      )}
      <Preview list={value} customPreview={customPreview} ref={previewRef} />
    </>
  ) : null
}

const UploadInternal = forwardRef<any, UploadProps>(_UploadInternal) as (
  props: PropsWithChildren<UploadProps> & { ref?: React.Ref<any> },
) => React.ReactElement

export default UploadInternal
