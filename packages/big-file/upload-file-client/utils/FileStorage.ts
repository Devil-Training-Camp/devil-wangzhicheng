/**
 * K key
 * T value
 */
export default abstract class FileStorage<K, T> {
  public abstract get(key: K): Promise<T>

  public abstract isExist(key: K): Promise<boolean>

  public abstract save(key: K, value: T): Promise<void>
}
