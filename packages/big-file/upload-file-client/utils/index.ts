export function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve: (val: void) => void) =>
    setTimeout(resolve, milliseconds)
  )
}
