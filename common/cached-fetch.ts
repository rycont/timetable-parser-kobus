import { CACHE_DIR } from '../const.ts'
import { createCacheFileName } from './cache-file-name.ts'

const cacheStore = new Map<string, string>()

export async function cachedFetch(
    filename: string,
    url: string,
    options?: RequestInit,
): Promise<{
    cached: boolean
    data: string
}> {
    const cacheFilePath = createCacheFileName(filename)

    try {
        if (cacheStore.has(cacheFilePath)) {
            return {
                cached: false,
                data: cacheStore.get(cacheFilePath) as string,
            }
        }

        const cache = await Deno.readTextFile(cacheFilePath)

        cacheStore.set(cacheFilePath, cache)

        return {
            cached: true,
            data: cache,
        }
    } catch (e) {
        if (!(e instanceof Deno.errors.NotFound)) {
            throw e
        }
    }

    // Fetch the data from the URL
    const response = await fetch(url, options)
    if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`)
    }
    const data = await response.text()

    // Save the content to the cache.
    await Deno.mkdir(CACHE_DIR, { recursive: true })
    await Deno.writeTextFile(cacheFilePath, data)

    cacheStore.set(cacheFilePath, data)

    await new Promise((resolve) => setTimeout(resolve, 700))

    return {
        cached: false,
        data,
    }
}
