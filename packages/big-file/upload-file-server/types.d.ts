// 返回通用结构
export interface ResponseParams<T> {
  code: number
  data: T
  message: string
}

// 判断文件是否存在
export interface FileHashRequestParams {
  name: string
  hash: string
  isChunk: boolean
}

export interface FileHashResponseParams {
  isExist: boolean
}
