export default async function removeOldCaches() {
    console.log('Cleaning up old caches...')
    const CACHE_DIR = Deno.env.get('CACHE_DIR') || './cache'

    const today = new Date().toISOString().split('T')[0]

    // 생성된 날짜가 오늘이 아닌 캐시 파일을 삭제합니다.
    for await (const file of Deno.readDir(CACHE_DIR)) {
        if (file.isFile && file.name.slice(0, 10) !== today) {
            const filePath = `${CACHE_DIR}/${file.name}`
            console.log(`Deleting old cache file: ${filePath}`)
            await Deno.remove(filePath)
        }

        console.log(`Cache directory cleaned up. Old caches removed.`)
    }
}
