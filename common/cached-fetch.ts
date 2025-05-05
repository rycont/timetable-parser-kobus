import { CACHE_DIR } from '../const.ts'
import { createCacheFileName } from './cache-file-name.ts'

export async function cachedFetch(
    filename: string,
    url: string,
    options?: RequestInit,
): Promise<string> {
    const cacheFilePath = createCacheFileName(filename)

    try {
        const cache = await Deno.readTextFile(cacheFilePath)
        console.log('Cache found, using cached data...')
        return cache as string
    } catch (e) {
        if (e instanceof Deno.errors.NotFound) {
            console.log(`Cache not found for ${filename}, fetching...`)
        } else {
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

    console.log(`Data cached to ${cacheFilePath}`)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    return data
}
