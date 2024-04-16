import request from './index'
import {
  type FileHashRequestParams,
  type FileHashResponseParams,
  type ResponseParams
} from '@big-file/upload-file-server/types'

export const findFile = (
  fileHashParams: FileHashRequestParams
): Promise<ResponseParams<FileHashResponseParams>> => {
  return request.get(`/files/findFile`, { params: fileHashParams })
}
