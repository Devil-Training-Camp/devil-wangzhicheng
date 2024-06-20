'use client'

import FileSelector from '@/components/FileSelector'
import { useState } from 'react'
import FileUploader from '@/components/FileUploader'

export default function Uploader() {
  const [files, setFiles] = useState<FileList>()
  // 选择文件时
  const handleFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    if (!e.target.files) {
      return
    }
    console.log('files', e.target.files)
    setFiles(e.target.files)
  }
  return (
    <>
      <FileSelector onChange={handleFileSelect} />
      {files &&
        Array.from(files).map((file: File) => (
          <FileUploader
            key={Date.now() + file.name}
            file={file}
            className="pb-2 border-b border-dashed w-full"
          />
        ))}
    </>
  )
}
