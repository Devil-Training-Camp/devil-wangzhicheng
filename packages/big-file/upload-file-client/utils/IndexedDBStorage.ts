import FileStorage from '@/utils/FileStorage'

export default class IndexedDBStorage extends FileStorage {
  private request: IDBOpenDBRequest
  private db: IDBDatabase | undefined

  constructor() {
    super()
    this.request = indexedDB.open('bigFile', 1)
    this.request.onupgradeneeded = (e: IDBVersionChangeEvent) => {
      this.db = e.target!.result
    }
  }

  public get(hash: string): Promise<any> {}

  public isExist(hash: string): Promise<boolean> {
    return
  }

  public save(): Promise<boolean> {}
}
