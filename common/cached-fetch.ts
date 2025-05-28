import { cacher } from './cacher.ts'

export async function cachedFetch(
    filename: string,
    url: string,
    options?: RequestInit,
    useDatePrefix = true,
): Promise<{
    cached: boolean
    data: string
}> {
    const cache = await cacher(filename, useDatePrefix)
    if (cache.hit) {
        return {
            cached: true,
            data: cache.data,
        }
    }

    // Fetch the data from the URL
    const response = await fetch(url, options)
    if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`)
    }
    const data = await response.text()

    await cache.create(data, 1) // 1 day expiration

    await new Promise((resolve) => setTimeout(resolve, 700))

    return {
        cached: false,
        data,
    }
}
