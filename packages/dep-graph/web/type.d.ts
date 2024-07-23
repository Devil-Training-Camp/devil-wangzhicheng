import { Dependencies } from '@dep-graph/core/dist/PackageParser'
declare global {
  interface window {
    __DEPS__: Dependencies
  }
}
