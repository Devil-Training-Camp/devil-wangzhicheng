import { checkFileExists, mergeFile, uploadChunk } from '@/api/uploadFile'
import { Dispatch, SetStateAction, useState } from 'react'
import { FilePiece, splitFile, StorageFilePieces } from '@/utils/file'
import FileStorage from '@/utils/FileStorage'
import IndexedDBStorage from '@/utils/IndexedDBStorage'
import { calcHash } from '@/utils/hash'
import PromisePool from '@/utils/PromisePool'
import { RETRY } from '@/const'

/**
 * -1 上传失败
 * 0 未有文件
 * 1 未开始上传
 * 2 上传中，本地处理
 * 3 暂停中
 * 4 上传成功
 * 5 上传中，可暂停
 * 6 上传中，合并文件
 */
export enum UploadStatus {
  Uploaded_Failed = -1,
  NotStart_NoFile = 0,
  NotStart_HasFile = 1,
  Uploading_LocalProcessing = 2,
  Uploading_Pause = 3,
  Uploaded_Success = 4,
  Uploading_UploadChunks = 5,
  Uploading_MergeChunks = 6
}

/**
 * 疑问：
 * 我感觉自己已经尽最大努力分解这个方法了
 * 还有什么更好的优化方法
 */
const useUpload = (
  file: File
): {
  upload: () => Promise<boolean>
  status: string
  setStatus: Dispatch<SetStateAction<string>>
  calcHashRatio: number
  setCalcHashRatio: Dispatch<SetStateAction<number>>
  requestPool: PromisePool | undefined
  setRequestPool: Dispatch<SetStateAction<PromisePool | undefined>>
  uploadStatus: number
  setUploadStatus: Dispatch<SetStateAction<UploadStatus>>
} => {
  const [status, setStatus] = useState<string>('')
  const [calcHashRatio, setCalcHashRatio] = useState<number>(0)
  const [requestPool, setRequestPool] = useState<PromisePool>()
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>(
    UploadStatus.NotStart_HasFile
  )

  const upload = async (): Promise<boolean> => {
    /**
     * step 1: 将切片保存到本地。如果切片已经保存在本地，直接取出来
     */
    const { fileChunks, hash } = await splitFileToChunks()
    /**
     * step 2 检查服务器是否存在文件，文件存在直接上传成功
     */
    const {
      data: checkData,
      code: checkCode,
      message: checkMessage
    } = await checkFileExists({
      name: file.name
    })
    // 你的服务端接口一直返回 200 的呢
    /**
     * 解释：
     * 错误的code在body.code中
     */
    if (checkCode !== 200) {
      setStatus('上传失败，' + checkMessage)
      return false
    }
    if (checkData.isExist) {
      setStatus('上传成功（秒传）')
      return true
    }

    /**
     * step 3: 创建并发池，上传切片
     */
    setStatus('上传中...')
    setUploadStatus(UploadStatus.Uploading_UploadChunks)
    const uploadChunksRes: boolean = await uploadChunks(
      fileChunks,
      file.name,
      0,
      hash
    )
    if (!uploadChunksRes) {
      setStatus(`上传失败，上传切片过程中失败`)
      return false
    }

    /**
     * step 4：合并文件
     */
    setStatus('合并文件中...')
    setUploadStatus(UploadStatus.Uploading_MergeChunks)
    const { code, message } = await mergeFile({
      name: file.name,
      hash,
      chunks: fileChunks.map((chunk, index) => ({
        index,
        size: chunk.size
      }))
    })
    if (code !== 200) {
      setStatus('上传失败，' + message)
      return false
    }
    setStatus('上传成功')
    return true
  }

  /**
   * 根据文件名存取文件切片
   */
  const splitFileToChunks = async () => {
    setStatus('开始上传...')
    let fileChunks: FilePiece[]
    let hash: string
    const filename = file.name
    const fs: FileStorage<string, StorageFilePieces> = new IndexedDBStorage<
      string,
      StorageFilePieces
    >('bigFile', 'FileChunk', 'filename', 'filename')

    if (await fs.isExist(filename)) {
      // 切片如果已经存在，直接取出
      // 哈，下面这句的调用方式好奇怪，
      // ;()
      // 啥意思？
      /**
       * 解答：
       * 1. 解构的方式赋值时，为了避免{}被解释成块，需要用()将整块语句包裹
       * 2. ;是预防性编程，因为我这里是不加分号的，为了避免被当作函数调用的括号
       */
      ;({ fileChunks, hash } = await fs.get(filename))
    } else {
      // 切片不存在，计算
      fileChunks = splitFile(file)
      hash = await calcHash({
        chunks: fileChunks
        /**
         * 不是顺序返回的，进度不好掌控，暂时注释掉
         */
        // onTick: (percentage: number): void => {
        //   setCalcHashRatio(Number(percentage.toFixed(2)))
        //   setStatus(`计算文件哈希中：${Math.floor(percentage * 100)}%`)
        // }
      })
      await fs.save(filename, {
        fileChunks,
        hash
      })
    }

    return {
      fileChunks,
      hash
    }
  }

  /**
   * 上传切片函数，递归重传
   */
  const uploadChunks = async (
    fileChunks: FilePiece[],
    filename: string,
    retry: number = 0,
    hash: string
  ): Promise<boolean> => {
    const requests = fileChunks.map(
      (chunk: FilePiece, index: number) => () =>
        pieceRequestHandler(chunk, hash, index)
    )
    // 创建请求池，设置最大同时请求数
    const requestPool = new PromisePool({
      limit: 5,
      onTick: (percentage: number): void => {
        setCalcHashRatio(Number(percentage.toFixed(2)))
        setStatus(`文件上传中：${Math.floor(percentage * 100)}%`)
      }
    })
    setRequestPool(requestPool)
    const piecesUpload = await requestPool.all(requests)
    console.log('上传结果', piecesUpload)

    // 重传
    if (!piecesUpload.every((res) => res.state === 'fulfilled' && res.data)) {
      if (retry >= RETRY) {
        return false
      }
      console.log('重传次数：', retry)
      const retryHashChunks = fileChunks.filter(
        (undefined, index: number) => !piecesUpload[index]
      )
      // sleep 3000 是啥意思？
      /**
       * 解释：
       * 等3秒重传，现在感觉没必要，删除了await sleep(3000)
       */
      return uploadChunks(retryHashChunks, filename, ++retry, hash)
    }
    return true
  }

  /**
   * 上传切片请求函数，先检查后上传
   */
  const pieceRequestHandler = async (
    fileChunk: FilePiece,
    hash: string,
    index: number
  ): Promise<boolean> => {
    const chunkName: string = `${hash}-$${index}`
    // 检查切片是否存在
    const { data: checkData, code: checkCode } = await checkFileExists({
      name: chunkName
    })
    if (checkCode !== 200) {
      return false
    }
    if (checkData.isExist) {
      return true
    }

    // 上传切片
    const formData = new FormData()
    formData.append('chunkName', chunkName)
    formData.append('chunk', fileChunk.chunk)
    const { code: uploadCode } = await uploadChunk(formData)
    return uploadCode === 200
  }

  return {
    upload,
    status,
    setStatus,
    calcHashRatio,
    setCalcHashRatio,
    requestPool,
    setRequestPool,
    uploadStatus,
    setUploadStatus
  }
}

export default useUpload
