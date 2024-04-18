export default abstract class FileStorage {
  public abstract get<T>(hash: string): Promise<T>

  public abstract isExist(hash: string): Promise<boolean>

  public abstract save(hash: string): Promise<boolean>
}
