import { CACHE_DIR } from '../const.ts'
const today = new Date().toISOString().split('T')[0]

export function createCacheFilePath(
    fileName: string,
    useDatePrefix = false,
): string {
    const cacheFilePath = useDatePrefix
        ? `${CACHE_DIR}/${today}-${fileName}`
        : `${CACHE_DIR}/${fileName}`
    return cacheFilePath
}
