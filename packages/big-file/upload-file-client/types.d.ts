// TODO 移动到upload-file-server中
// 返回通用结构
export interface ResponseParams<T> {
  code: number
  data: T
  message: string
}

export interface FileHashRequestParams {
  name: string
  hash: string
}

export interface FileHashResponseParams {
  isExist: boolean
}
