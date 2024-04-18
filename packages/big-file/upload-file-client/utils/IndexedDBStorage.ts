import FileStorage from '@/utils/FileStorage'

export default class IndexedDBStorage extends FileStorage {
  private request: IDBOpenDBRequest
  private db: IDBDatabase | undefined
  private dbName: string
  private storeName: string
  private keyPath: string

  constructor(dbName: string, storeName: string, keyPath: string) {
    super()
    this.dbName = dbName
    this.storeName = storeName
    this.keyPath = keyPath
    this.request = indexedDB.open(this.dbName, 1)
    this.request.onupgradeneeded = (e: IDBVersionChangeEvent) => {
      const db: IDBDatabase = (e.target as IDBOpenDBRequest).result
      // keyPath是主键
      const objectStore: IDBObjectStore = db.createObjectStore(this.storeName, {
        keyPath: this.keyPath
      })
      objectStore.createIndex(this.keyPath, this.keyPath, { unique: true })
    }
    this.request.onerror = () => {
      console.error('创建数据库失败')
    }
  }

  // 读取数据
  public get(hash: string): Promise<any> {}

  // 通过哈希查询数据是否存在
  public async isExist(hash: string): Promise<boolean> {
    return new Promise(
      (
        resolve: (isExist: boolean) => void,
        reject: (reason: DOMException | null) => void
      ): void => {
        this.request.onsuccess = (e: Event) => {
          this.db = (e.target as IDBOpenDBRequest).result
          const request: IDBRequest = this.db
            .transaction(this.storeName, 'readonly')
            .objectStore(this.storeName)
            .get(hash)
          request.onsuccess = (e: Event) => {
            console.log('哈希查询结果：', request.result)
            if (request.result) {
              resolve(true)
            }
            resolve(false)
          }
          request.onerror = (e: Event) => {
            console.log('事物失败：', request.error)
            reject(request.error)
          }
        }
      }
    )
  }

  public save(): Promise<boolean> {}
}
