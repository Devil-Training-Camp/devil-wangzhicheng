import * as path from 'node:path'

// @ts-ignore
export const UPLOAD_FOLDER_PATH = path.join(
  path.dirname(new URL(import.meta.url).pathname),
  '../../uploads'
)
