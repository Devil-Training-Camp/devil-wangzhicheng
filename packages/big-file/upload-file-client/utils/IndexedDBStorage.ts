import FileStorage from '@/utils/FileStorage'

export default class IndexedDBStorage<K, T> extends FileStorage<K, T> {
  private request: IDBOpenDBRequest | undefined
  private db: IDBDatabase | undefined
  private readonly dbName: string
  private readonly storeName: string
  private readonly keyPath: string

  constructor(dbName: string, storeName: string, keyPath: string) {
    super()
    this.dbName = dbName
    this.storeName = storeName
    this.keyPath = keyPath
  }

  // 连接数据库
  private async connect(): Promise<boolean> {
    if (this.db) {
      return true
    }
    return new Promise(
      (
        resolve: (opened: boolean) => void,
        reject: (reason: DOMException | null) => void
      ) => {
        this.request = indexedDB.open(this.dbName, 1)
        this.request.onupgradeneeded = (e: IDBVersionChangeEvent) => {
          this.db = (e.target as IDBOpenDBRequest).result
          // 创建objectStore对象，keyPath是主键
          const objectStore: IDBObjectStore = this.db.createObjectStore(
            this.storeName,
            {
              keyPath: this.keyPath
            }
          )
          // 创建索引
          objectStore.createIndex(this.keyPath, this.keyPath, { unique: true })
          console.log('创建数据库成功')
        }
        this.request.onerror = (e: Event) => {
          console.error('创建数据库失败')
        }
        this.request.onsuccess = (e: Event) => {
          console.log('打开数据库成功')
          this.db = (e.target as IDBOpenDBRequest).result
          resolve(true)
        }
      }
    )
  }

  // 读取数据
  public get(key: K): Promise<T> {
    return Promise.resolve({} as T)
  }

  // 通过哈希查询数据是否存在
  public async isExist(key: K): Promise<boolean> {
    const isConnect: boolean = await this.connect()
    if (!isConnect) {
      return false
    }
    return new Promise(
      (
        resolve: (isExist: boolean) => void,
        reject: (reason: DOMException | null) => void
      ): void => {
        const request: IDBRequest = this.db!.transaction(
          this.storeName,
          'readonly'
        )
          .objectStore(this.storeName)
          .get(String(key))
        request.onsuccess = (e: Event): void => {
          console.log('哈希查询结果：', request.result)
          if (request.result) {
            resolve(true)
          }
          resolve(false)
        }
        request.onerror = (e: Event) => {
          console.log('查询事物失败：', request.error)
          reject(request.error)
        }
      }
    )
  }

  public async save(key: K, value: T): Promise<void> {
    const isConnect: boolean = await this.connect()
    if (!isConnect) {
      return
    }
    return new Promise(
      (
        resolve: () => void,
        reject: (reason: DOMException | null) => void
      ): void => {
        const request: IDBRequest = this.db!.transaction(
          this.storeName,
          'readwrite'
        )
          .objectStore(this.storeName)
          .add({
            [this.keyPath]: key,
            value
          })
        request.onsuccess = (e: Event): void => {
          console.log('添加成功')
          resolve()
        }
        request.onerror = (e: Event): void => {
          console.log('添加事物失败：', request.error)
          reject(request.error)
        }
      }
    )
  }
}
