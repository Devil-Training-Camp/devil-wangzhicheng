import { PackageParser } from '@dep-graph/core'

export interface ActionParams {
  path: string
  options: {
    D: string
    J: string
  }
}

export default function action({ path, options }: ActionParams): void {
  const pp = new PackageParser('./')
  console.log('pp', pp)
}
