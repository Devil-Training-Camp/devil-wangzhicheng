'use client'

import Progress from '@/components/Progress'
import useUpload from '@/components/useUpload'

// 这个文件太长了，拆一下
/**
 * 优化:
 * 上传拆解到useUpload.ts中
 */

export default function Uploader() {
  // 文件上传
  const {
    upload,
    status,
    setStatus,
    calcHashRatio,
    setCalcHashRatio,
    uploadFile,
    setUploadFile,
    requestPool,
    setRequestPool,
    uploadStatus,
    setUploadStatus
  } = useUpload()

  // 选择文件时
  const handleFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const file: File = e.target.files![0]
    setUploadFile(file)
    setUploadStatus(1)
    setStatus('开始上传吧！')
  }

  // 开始上传时
  const handleStartUpload = async (): Promise<void> => {
    setUploadStatus(2)
    const uploadSuccess: boolean = await upload(uploadFile!)
    setUploadStatus(uploadSuccess ? 1 : 4)
    if (uploadSuccess) {
      setUploadFile(undefined)
      setRequestPool(undefined)
      setCalcHashRatio(0)
      setUploadStatus(6)
    }
  }

  // 暂停时
  const handlePause = () => {
    console.log('requestPool', requestPool)
    requestPool!.pause()
    setUploadStatus(3)
  }

  // 继续上传时
  const handleGoOn = () => {
    requestPool!.continue()
    setUploadStatus(5)
  }

  // 上传状态表
  const uploadActionMap: any = {
    '-1': {
      label: '重新上传',
      action: handleStartUpload
    },
    '1': {
      label: '上传',
      action: handleStartUpload
    },
    '2': {
      label: '处理中...',
      action: () => {}
    },
    '5': {
      label: '暂停',
      action: handlePause
    },
    '3': {
      label: '继续',
      action: handleGoOn
    }
  }

  return (
    <div className="flex flex-col space-y-8">
      <label htmlFor="uploader">
        <input
          type="file"
          name="uploader"
          onChange={handleFileSelect}
          multiple
        />
      </label>
      {/* 这看起来不支持多文件并发上传 */}
      {/* 改一下吧 */}
      <p>{status}</p>
      {uploadActionMap[uploadStatus] && (
        <button
          className="border-white border-2 rounded-full px-2 py-1 w-28"
          onClick={uploadActionMap[uploadStatus].action}
        >
          {uploadActionMap[uploadStatus].label}
        </button>
      )}
      {uploadFile && (
        <>
          <Progress ratio={calcHashRatio} />
          <p>{uploadFile.name}</p>
        </>
      )}
    </div>
  )
}
