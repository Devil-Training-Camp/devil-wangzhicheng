import packageParserFactory from './utils/packageParserFactory'
import PackageParser, { Dependencies } from '@dep-graph/core/dist/PackageParser'
import * as fsPromise from 'fs/promises'
import * as path from 'node:path'
import DepGraphServer from './utils/DepGraphServer'

export interface AnalyzeOptions {
  D?: string // 遍历的深度
  J?: string // 输出为json文件
}

/**
 *
 * @param {string} dir 解析的文件夹路径
 * @param {AnalyzeOptions} options analyze命令的可选项
 * @returns {Promise<void>}
 */
const action = async (dir: string, options: AnalyzeOptions): Promise<void> => {
  const depth: number = options.D === undefined ? Infinity : Number(options.D)

  const pp: PackageParser = await packageParserFactory(dir)
  const deps: Dependencies = await pp.parse(depth)
  if (options.J) {
    // 输出为JSON文件
    await outputAsJSON(deps, options.J)
  } else {
    // 打开网站
    await openHTML(deps)
  }
}

/**
 *
 * @param {Dependencies} deps 生成的依赖
 * @param {string} filepath 文件路径
 * @returns {Promise<void>}
 */
const outputAsJSON = async (
  deps: Dependencies,
  filepath: string
): Promise<void> => {
  const absFilepath: string = path.resolve(__dirname, filepath)
  try {
    await fsPromise.writeFile(absFilepath, JSON.stringify(deps, null, 4))
    console.log(`JSON file ${filepath} has been created successfully`)
  } catch (err) {
    console.error(`JSON file created failed`)
  }
}

const openHTML = async (deps: Dependencies): Promise<void> => {
  const server = new DepGraphServer(deps)
  server.start()
  server.open()
}

export default action
