import * as path from 'node:path'

export const UPLOAD_FOLDER_PATH = path.join(
  // @ts-ignore
  path.dirname(new URL(import.meta.url).pathname),
  '../../uploads'
)
