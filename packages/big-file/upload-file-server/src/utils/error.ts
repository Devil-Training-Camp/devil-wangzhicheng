export enum ErrorType {
  FileWriteError = 10001,
  FileMergeError = 10002,
  FileCheckExistError = 10003
}

export default class HError {
  public code: ErrorType
  public message: string

  constructor(code: ErrorType, message: string) {
    this.code = code
    this.message = message
  }
}
