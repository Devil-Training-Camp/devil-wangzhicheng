// 返回通用结构
export interface ResponseParams<T> {
  code: number
  data: T
  message: string
}

// 合并文件
export interface FileMergeRequestParams {
  name: string
  hash: string
}

// 判断文件是否存在
export interface FileHashRequestParams extends FileMergeRequestParams {
  isChunk: boolean
}

export interface FileHashResponseParams {
  isExist: boolean
}

// 上传文件信息
interface chunkInfo {
  hash: string
  index: number
}

export interface UploadFileInfoRequestParams extends FileMergeRequestParams {
  chunks: chunkInfo[]
}
