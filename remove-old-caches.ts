const DATE_REGEX = /^\d{4}-\d{2}-\d{2}/
const CACHE_DIR = Deno.env.get('CACHE_DIR') || './cache'
const TODAY_YYYY_MM_DD = new Date().toISOString().split('T')[0]

export default async function removeOldCaches() {
    // 생성된 날짜가 오늘이 아닌 캐시 파일을 삭제합니다.
    for await (const file of Deno.readDir(CACHE_DIR)) {
        const prefix = file.name.slice(0, 10)
        if (!DATE_REGEX.test(prefix)) {
            continue
        }

        if (file.isFile && !isNaN(+prefix[0]) && prefix !== TODAY_YYYY_MM_DD) {
            const filePath = `${CACHE_DIR}/${file.name}`
            console.log(`Deleting old cache file: ${filePath}`)
            await Deno.remove(filePath)
        }
    }

    // await removeBustagoCaches()

    console.log(`Cache directory cleaned up. Old caches removed.`)
}
