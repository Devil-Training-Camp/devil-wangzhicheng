export default abstract class FileStorage {
  public abstract get(hash: string): Promise<any>

  public abstract isExist(hash: string): Promise<boolean>

  public abstract save(hash: string): Promise<boolean>
}
