import { CACHE_DIR } from '../const.ts'
const today = new Date().toISOString().split('T')[0]

export function createCacheFileName(fileName: string): string {
    const cacheFilePath = `${CACHE_DIR}/${today}-${fileName}`
    return cacheFilePath
}
