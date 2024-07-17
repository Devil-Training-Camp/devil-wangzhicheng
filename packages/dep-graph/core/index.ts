import { readWantedLockfile } from '@pnpm/lockfile-file'
import * as fsPromise from 'node:fs/promises'
import * as path from 'node:path'

const getLockfile = async () => {
  const lockpath = path.resolve(__dirname, '../big-file/upload-file-client')
  console.log('path', path.resolve('../', lockpath))
  const data = await readWantedLockfile(lockpath, { ignoreIncompatible: true })
  // console.log('logfile', data)
  await fsPromise.writeFile('lock.json', JSON.stringify(data, null, 4))
}

getLockfile()
