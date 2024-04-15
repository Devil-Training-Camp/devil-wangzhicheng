import request from 'axios'
import {
  type FileHashRequestParams,
  type FileHashResponseParams,
  type ResponseParams
} from '@/types'

export const findFile = (
  fileHashParams: FileHashRequestParams
): Promise<ResponseParams<FileHashResponseParams>> => {
  return request.get(`/files/findFile`, { params: fileHashParams })
}
