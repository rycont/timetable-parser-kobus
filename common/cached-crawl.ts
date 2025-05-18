import puppeteer from 'puppeteer-core'
import { createCacheFileName } from './cache-file-name.ts'
import { CACHE_DIR } from '../const.ts'

const browser = await puppeteer.launch({
    executablePath: Deno.env.get('CHROME_PATH') || '/usr/local/bin/chrome',
    headless: true,
    args: ['--no-sandbox'],
})

const cacheStore = new Map<string, string[]>()

export async function cachedCrawl({
    entryPoint,
    fileName,
    targetUri,
    action,
    useDatePrefix = true,
}: {
    entryPoint: string
    targetUri: string
    fileName: string
    action?: (page: puppeteer.Page) => Promise<void>
    useDatePrefix?: boolean
}): Promise<{
    fresh: boolean
    data: string[]
}> {
    const cacheFilePath = createCacheFileName(fileName, useDatePrefix)

    try {
        if (cacheStore.has(cacheFilePath)) {
            return {
                fresh: false,
                data: cacheStore.get(cacheFilePath) as string[],
            }
        }

        const cache = await Deno.readTextFile(cacheFilePath)

        const data = JSON.parse(cache) as string[]
        cacheStore.set(cacheFilePath, data)

        return {
            fresh: false,
            data,
        }
    } catch (e) {
        if (!(e instanceof Deno.errors.NotFound)) {
            throw e
        }

        // The rest of your script remains the same.
        const context = await browser.createBrowserContext()
        const page = await context.newPage()
        // await page.setRequestInterception(true)

        const responseContents: string[] = []

        const responsePromise = new Promise<void>((resolve) => {
            page.on('response', async (response) => {
                if (response.url().includes(targetUri)) {
                    const content = await response.text()
                    responseContents.push(content)
                    resolve()
                }
            })
        })

        await page.goto(entryPoint, {
            waitUntil: 'networkidle2',
        })

        if (action) {
            await action(page)
        }

        await responsePromise

        await new Promise((resolve) => setTimeout(resolve, 100))
        
        await page.close()
        await context.close()

        // Save the content to the cache.
        await Deno.mkdir(CACHE_DIR, { recursive: true })
        await Deno.writeTextFile(
            cacheFilePath,
            JSON.stringify(responseContents),
        )

        cacheStore.set(cacheFilePath, responseContents)

        return {
            fresh: true,
            data: responseContents,
        }
    }
}

export async function closeBrowser() {
    await browser.close()
    console.log('Browser closed')
}
