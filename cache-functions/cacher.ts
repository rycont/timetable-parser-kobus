import { z } from 'zod'
import { createCacheFilePath } from './cache-file-name.ts'

export const cacheV2Scheme = z.object({
    created: z.string().datetime(),
    expires: z.string().datetime(),
    data: z.string(),
    version: z.literal('2'),
})

export async function cacher(fileName: string, useDatePrefix: boolean) {
    try {
        // Assume CacheV2

        const filepath = createCacheFilePath(fileName)
        const fileText = await Deno.readTextFile(filepath)

        try {
            const cacheV2Parsed = cacheV2Scheme.safeParse(JSON.parse(fileText))

            if (cacheV2Parsed.success) {
                return {
                    hit: true as const,
                    data: cacheV2Parsed.data.data,
                }
            }
        } catch (e) {
            console.error(e)
            if (e instanceof SyntaxError) {
                console.warn(
                    `Cache file ${filepath} is not valid JSON, trying to read as Cache V1.`,
                )
            } else {
                throw e
            }
        }

        console.log('Updated cache file to v2 format:', filepath)
        // It's cache v1 without datePrefix
        const now = new Date()
        const expires = new Date(now)
        expires.setDate(expires.getDate() + 1) // 1 day expiration

        const cachePayload = cacheV2Scheme.parse({
            created: now.toISOString(),
            expires: expires.toISOString(),
            data: fileText,
            version: '2',
        })

        await Deno.writeTextFile(filepath, JSON.stringify(cachePayload))

        return {
            hit: true as const,
            data: fileText,
        }
    } catch (e) {
        if (e instanceof Deno.errors.NotFound) {
            // console.log(`[Cacher] Cache miss for ${fileName}`)
        } else {
            console.error(e)
        }

        const canTryCacheV1 = e instanceof Deno.errors.NotFound && useDatePrefix
        if (canTryCacheV1) {
            return tryCacheV1(fileName)
        }

        return {
            hit: false as const,
            create: async (data: string, expiresIn: number) => {
                const now = new Date()
                const expires = new Date(now)

                expires.setDate(expires.getDate() + expiresIn)

                const cachePayload = cacheV2Scheme.parse({
                    created: now.toISOString(),
                    expires: expires.toISOString(),
                    data,
                    version: '2',
                })

                const filepath = createCacheFilePath(fileName)
                await Deno.writeTextFile(filepath, JSON.stringify(cachePayload))
            },
        }
    }
}

async function tryCacheV1(fileName: string) {
    try {
        const filepath = createCacheFilePath(fileName, true)
        const content = await Deno.readTextFile(filepath)

        // Rewrite to Cache V2 format

        const now = new Date()
        const expires = new Date(now)

        expires.setDate(expires.getDate() + 1) // 1 day expiration

        const cachePayload = cacheV2Scheme.parse({
            created: now.toISOString(),
            expires: expires.toISOString(),
            data: content,
            version: '2',
        })

        console.log('Updated cache file to v2 format:', filepath)
        const filapathWithDatePrefix = createCacheFilePath(fileName)
        await Deno.writeTextFile(
            filapathWithDatePrefix,
            JSON.stringify(cachePayload),
        )

        // Cache v1 is just a string
        return {
            hit: true as const,
            data: content,
        }
    } catch (e) {
        console.error(e)
        if (e instanceof Deno.errors.NotFound) {
            return {
                hit: false as const,
                create: async (data: string, expiresIn: number) => {
                    const now = new Date()
                    const expires = new Date(now)

                    expires.setDate(expires.getDate() + expiresIn)

                    const cachePayload = cacheV2Scheme.parse({
                        created: now.toISOString(),
                        expires: expires.toISOString(),
                        data,
                        version: '2',
                    })

                    const filepath = createCacheFilePath(fileName)
                    await Deno.writeTextFile(
                        filepath,
                        JSON.stringify(cachePayload),
                    )
                },
            }
        }
        throw e
    }
}
