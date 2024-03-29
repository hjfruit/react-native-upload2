@fruits-chain/react-native-upload

> 一个用于文件上传的 React-Native 组件

- 支持图片、视频以及文件上传
- 支持图片/视频压缩（Android & iOS）使用[react-native-compressor](https://github.com/Shobbak/react-native-compressor)
- 支持断点续传
- 支持多图片&视频预览以及自定义文件类型预览
- 可自定义上传后的显示 UI
- 内置一套相机拍摄 UI（欢迎使用）
- 图片水印，支持文本和图片 overlay 的形式

## 安装

1. 安装 `@fruits-chain/react-native-upload`

```bash
$ yarn add @fruits-chain/react-native-upload
```

安装依赖库

\*[react-native-blob-util](https://github.com/RonRadtke/react-native-blob-util) 基础文件操作

[react-native-fs](https://github.com/itinance/react-native-fs) 文件操作（计算 hash 值）

[react-native-compressor](https://github.com/Shobbak/react-native-compressor) 图片&视频压缩

\*[react-native-image-crop-picker](https://github.com/ivpusic/react-native-image-crop-picker) 图片&视频拍摄、选择

[react-native-video](https://github.com/react-native-video/react-native-video) 视频播放组件

[react-native-fast-image](https://github.com/DylanVann/react-native-fast-image) 高效图片组件

[react-native-document-picker](https://github.com/rnmods/react-native-document-picker) 文档选择

[react-native-photo-manipulator](https://github.com/guhungry/react-native-photo-manipulator) 图片水印

\*[react-native-vision-camera](https://github.com/mrousavy/react-native-vision-camera) 自定义上传 UI 使用的拍照库

⭐️[@fruits-chain/react-native-xiaoshu](https://github.com/hjfruit/react-native-xiaoshu) RN 基础组件库，提供模式选择器和图片列表渲染等组件

根据依赖库指引进行设置，带“\*”的表示需要设置配置权限

## 使用

```js
import React, { Component } from 'react'
import { render } from 'react-dom'
import Upload from '@fruits-chain/react-native-upload'
const UploadPage: React.FC = () => {
  const [images, setImages] = useState([])
  const [document, setDoucument] = useState([])
  return (
    <View>
      <Upload uploadAction={...} tipText={langs.picsAndVideo} maxCount={10} list={images} onChange={(val) => setImages(val)} />
      <Upload.Preview list={images} />
      // tip: 使用`Upload.Wrapper`的方式不会渲染默认操作UI，可进行自定义显示
      <Upload.Wrapper uploadAction={...} tipText={langs.picsAndVideo} maxCount={10} list={images} onChange={(val) => setImages(val)} >
        <Text>上传文件</Text>
      </Upload.Wrapper>
      <View>
        {
          images.map(image => ...)
        }
      </View>
      // 文档上传
      <Upload mediaType="document" uploadAction={...} tipText="文件" maxCount={10} list={document} onChange={(val) => setDocument(val)} />
    </View>
  )
}
```

### 屏幕截图

<div style="display: flex; flex-wrap: no-wrap">
  <img alt="默认" src="./case-1.png" width=200 height=433 />
  <img alt="模式选择" src="./case-2.png" width=200 height=433 />
  <img alt="包含照片" src="./case-3.png" width=200 height=433/>
  <img alt="图片预览" src="./case-4.jpg" width=200 height=433 />
</div>

### 可运行的 Demo

见[example](./example)目录

> 注意：正常运行前需要使用各自的上传接口

### API

> `？`表示可选参数

| 参数                  | 类型                                                           | 说明                                                                              | 默认值                         | 版本  |     |
| --------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------ | ----- | --- |
| list?                 | `IUploadSource`[]                                              | 当前上传的文件列表                                                                | -                              | -     |     |
| defaultList?          | `IUploadSource`[]                                              | 默认上传的文件列表                                                                | []                             | -     |     |
| onChange?             | (list:`IUploadSource`[]) => void                               | 上传文件变更/状态变更时调用此方法                                                 | -                              | -     |     |
| onUploadError?        | (msg?: any) => void                                            | 上传出错时的回调                                                                  | -                              | -     |     |
| maxCount?             | number                                                         | 最大可上传数量                                                                    | 10                             | -     |     |
| tipText?              | string                                                         | 上传提示文本                                                                      | -                              | -     |     |
| multiple?             | boolean                                                        | 是否支持多选上传                                                                  | true                           | -     |     |
| uploadAction?         | `UploadAction`                                                 | 上传接口封装的函数                                                                | -                              | -     |     |
| cropping?             | boolean                                                        | 是否进行裁剪                                                                      | false                          | -     |     |
| width?                | number                                                         | cropping 模式下选取图片的宽度                                                     | 300                            | -     |     |
| height?               | number                                                         | cropping 模式下选取图片的高度                                                     | 300                            | -     |     |
| allowResume?          | `boolean or number`                                            | 是否支持续传（传入 `number`时表示只有压缩后大于 `number`字节的文件会开启续传      | false                          | 1.2.0 |     |
| progressAction?       | (fileHash: string) => Promise<{fileUrl: string; size: number}> | 获取上传当前图片上传进度                                                          | -                              | 1.2.0 |     |
| compress?             | boolean                                                        | 是否开启压缩                                                                      | true                           | 1.2.0 |     |
| imagesPerRow?         | number                                                         | 每一行显示的个数                                                                  | 4                              | 1.3.8 |     |
| count?                | `number or RegularCount[]`                                     | 固 regular 模式下，设置固定上传个数及文案                                         | -                              | 1.3.9 |     |
| customPreview?        | `CustomPreview`                                                | 自定义预览的组件映射 key: 文件名后缀 value:自定义预览组件                         | -                              | 1.4.0 |     |
| pickerType?           | `PickerType or PickerType[]`                                   | 指定选择器类型                                                                    | ['cropPicker', 'visionCamera'] | 2.0.0 |     |
| cropPickerMediaType?  | `CropMediaType`                                                | pickerType 为 cropPicker 的 mediaType                                             | `any`                          | 2.0.2 |     |
| title                 | string                                                         | 用于 pickerType 为 `visionCamera`时 UI 的标题                                     | -                              | 2.0.0 |     |
| watermark?            | `WatermarkOperations`                                          | 配置图片水印，`2.3.0`支持图片作为水印                                             | -                              | 2.1.0 |     |
| backUpload?           | boolean                                                        | 是否启用后台上传（启用后不会执行文件上传动作）                                    | false                          | 2.2.0 |     |
| shouldPrintWatermark? | boolean or `PrintWaterMarkFn`                                  | 是否绘制水印                                                                      | true                           | 2.4.0 |     |
| beforeDelete?         | `UploadItem[] \| boolean \| Promise<UploadItem[] \| boolean> ` | 删除前的钩子函数，返回 `boolean` 表示是否继续，返回数据将会替换默认结果，支持异步 | -                              | 2.4.1 |     |

```ts
interface UploadItem {
  key: string // 当前资源的唯一标识
  path?: string // 本地资源路径
  name?: string // 名称
  type?: string // 类型
  status?: 'loading' | 'done' | 'error' // 资源状态
  origin?: FileVO // 远程上传结果
  /**
   * 本地文件资源路径
   */
  uri?: string
  /**
   * 切分后的文件资源路径
   */
  sliceUri?: string
  /**
   * 文件大小
   */
  size?: number
  /**
   * 文件hash值
   */
  hash?: string
  /**
   * 当次文件偏移
   */
  offset?: number
  /**
   * 当前文件是否需要断点续传
   */
  resume?: boolean
  /**
   * 是否可删除
   * @default true
   */
  deletable?: boolean
}

export type UploadAction = ({ data, file }: UploadActionParams) => Promise<FileVO>

interface FileVO {
  /** 文件ID */
  fileId?: string

  /** 文件上传时间戳 */
  fileUploadTime?: number

  /** 文件地址 */
  fileUrl?: string

  /** 文件名称 */
  filename?: string
}
```

### 缓存

> 此上传组件在文件压缩/断点续传等阶段会产生大量的缓存文件，并且默认不会清除，在 `2.2.0`版本，提供了两个 API 来快速感知上传缓存和清除缓存，你也可以通过 `UPLOAD_CACHE_DIR`获取缓存目录从而更灵活的实现清除缓存的功能

#### `function cacheDirStat(): Promise<CacheDirStat>`

> 获取文件上传缓存文件夹的统计信息

#### `function clearCache(): Promise<ClearCacheResult>`

> 清除上传文件夹缓存
> ⚠️ 清除缓存后，再次上传同一文件的处理效率将会下降

具体使用方式见[example](./example)
