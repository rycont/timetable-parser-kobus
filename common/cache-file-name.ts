import { CACHE_DIR } from '../const.ts'
const today = new Date().toISOString().split('T')[0]

export function createCacheFileName(
    fileName: string,
    useDatePrefix: boolean,
): string {
    const cacheFilePath = useDatePrefix
        ? `${CACHE_DIR}/${today}-${fileName}`
        : `${CACHE_DIR}/${fileName}`
    return cacheFilePath
}
