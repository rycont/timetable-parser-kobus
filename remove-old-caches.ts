import { cacheV2Scheme } from './common/cacher.ts'

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}/
const CACHE_DIR = Deno.env.get('CACHE_DIR') || './cache'

export default async function removeOldCaches() {
    // 생성된 날짜가 오늘 날짜보다 이전인 캐시 파일 삭제
    for await (const file of Deno.readDir(CACHE_DIR)) {
        const content = await Deno.readTextFile(`${CACHE_DIR}/${file.name}`)

        const parsedCache = cacheV2Scheme.safeParse(JSON.parse(content))

        if (parsedCache.success) {
            // Is cache V2
            const expires = new Date(parsedCache.data.expires)
            const hasExpired = expires < new Date()

            if (hasExpired) {
                const filePath = `${CACHE_DIR}/${file.name}`
                await Deno.remove(filePath)
            }
        } else {
            const prefix = file.name.slice(0, 10)
            // Is cache V1
            if (!DATE_REGEX.test(prefix)) {
                console.warn(`Invalid cache file name: ${file.name}`)
            }

            // Check if the prefix is a valid date

            if (file.isFile && !isNaN(+prefix[0]) && isOldCache(prefix)) {
                const filePath = `${CACHE_DIR}/${file.name}`
                await Deno.remove(filePath)
            }
        }
    }

    console.log(`Cache directory cleaned up. Old caches removed.`)
}

function isOldCache(yyyymmdd: string) {
    const today = new Date()
    const cacheDate = new Date(yyyymmdd)
    cacheDate.setHours(0, 0, 0, 0) // Set time to midnight
    today.setHours(0, 0, 0, 0) // Set time to midnight

    return cacheDate < today
}

if (import.meta.main) {
    await removeOldCaches()
}
