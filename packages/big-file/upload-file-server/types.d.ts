// 返回通用结构
export interface ResponseParams<T> {
  code: number
  data: T
  message: string
}

// 基础
interface FileBaseRequestParams {
  name: string
  hash: string
}

// 合并文件
export interface FileMergeRequestParams extends FileBaseRequestParams {
  chunks: ChunkInfo[]
}

// 判断文件是否存在
export interface CheckFileExistsRequestParams {
  name: string
}

export interface FileHashResponseParams {
  isExist: boolean
}

// 上传文件信息
interface ChunkInfo {
  index: number
  size: number
}
