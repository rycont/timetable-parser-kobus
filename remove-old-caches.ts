const DATE_REGEX = /^\d{4}-\d{2}-\d{2}/
const CACHE_DIR = Deno.env.get('CACHE_DIR') || './cache'
const TODAY_YYYY_MM_DD = new Date().toISOString().split('T')[0]

export default async function removeOldCaches() {
    // 생성된 날짜가 오늘이 아닌 캐시 파일을 삭제합니다.
    for await (const file of Deno.readDir(CACHE_DIR)) {
        const datePrefix = file.name.slice(0, 10)
        if (!DATE_REGEX.test(datePrefix)) {
            continue
        }

        if (file.isFile && datePrefix !== TODAY_YYYY_MM_DD) {
            const filePath = `${CACHE_DIR}/${file.name}`
            console.log(`Deleting old cache file: ${filePath}`)
            await Deno.remove(filePath)
        }
    }

    await removeBustagoCaches()

    console.log(`Cache directory cleaned up. Old caches removed.`)
}

const BUSTAGO_PLAN_FILE_REGEX =
    /^bustago-plans-.*?-.*?-(\d{4})(\d{2})(\d{2})\.json$/

async function removeBustagoCaches() {
    // Bustago Cache files are starts with name "bustago-"
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayTimestamp = +today

    for await (const file of Deno.readDir(CACHE_DIR)) {
        if (!file.isFile) {
            continue
        }

        if (!file.name.startsWith('bustago-')) {
            continue
        }

        const match = file.name.match(BUSTAGO_PLAN_FILE_REGEX)
        if (!match) {
            continue
        }

        const year = +match[1]
        const month = +match[2] - 1 // month is 0-indexed
        const day = +match[3]

        const fileDate = new Date(year, month, day)
        const fileTimestamp = +fileDate
        if (fileTimestamp >= todayTimestamp) {
            continue
        }

        const filePath = `${CACHE_DIR}/${file.name}`
        console.log(`Deleting old bustago cache file: ${filePath}`)
        await Deno.remove(filePath)
    }
}
