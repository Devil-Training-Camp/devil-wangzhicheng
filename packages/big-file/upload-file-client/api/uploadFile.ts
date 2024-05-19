import request from './index'
import {
  FileHashRequestParams,
  FileHashResponseParams,
  ResponseParams,
  UploadChunkRequestParams,
  UploadChunkResponseParams
} from '@big-file/upload-file-server/types'

// 判断文件是否存在服务器上
export const checkFileExists = (
  params: FileHashRequestParams
): Promise<ResponseParams<FileHashResponseParams>> => {
  return request.get(`/files/checkFileExists`, { params })
}

// 上传切片
export const uploadChunk = (
  data: UploadChunkRequestParams
): Promise<ResponseParams<UploadChunkResponseParams>> => {
  return request.post(`/files/uploadChunk`, data)
}

// 合并文件
export const mergeFile = (
  params: FileHashRequestParams
): Promise<ResponseParams<UploadChunkResponseParams>> => {
  return request.get(`/files/mergeFile`, { params })
}
