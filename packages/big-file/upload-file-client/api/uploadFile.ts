import request from './index'
import {
  FileHashRequestParams,
  FileHashResponseParams,
  FileMergeRequestParams,
  ResponseParams,
  UploadFileInfoRequestParams
} from '@big-file/upload-file-server/types'

// 判断文件是否存在服务器上
export const checkFileExists = (
  params: FileHashRequestParams
): Promise<ResponseParams<FileHashResponseParams>> => {
  return request.get(`/files/checkFileExists`, { params })
}

// 上传文件信息
export const uploadFileInfo = (
  data: UploadFileInfoRequestParams
): Promise<ResponseParams<null>> => {
  return request.post(`/files/uploadFileInfo`, data)
}

// 上传切片
export const uploadChunk = (data: FormData): Promise<ResponseParams<null>> => {
  return request.post(`/files/uploadChunk`, data)
}

// 合并文件
export const mergeFile = (
  params: FileMergeRequestParams
): Promise<ResponseParams<null>> => {
  return request.get(`/files/mergeFile`, { params })
}
