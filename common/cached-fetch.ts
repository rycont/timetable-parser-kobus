import puppeteer from 'puppeteer-core'

const CACHE_DIR = Deno.env.get('CACHE_DIR') || './cache'

const browser = await puppeteer.launch({
    executablePath: Deno.env.get('CHROME_PATH') || '/usr/local/bin/chrome',
    headless: true,
    args: ['--no-sandbox'],
})

async function cachedCrawl({
    entryPoint,
    fileName,
    targetUri,
    action,
}: {
    entryPoint: string
    targetUri: string
    fileName: string
    action?: (page: puppeteer.Page) => Promise<void>
}) {
    try {
        const cache = await Deno.readTextFile(`${CACHE_DIR}/${fileName}`)
        console.log('Cache found, using cached data...')
        return JSON.parse(cache) as string[]
    } catch (e) {
        if (e instanceof Deno.errors.NotFound) {
            console.log(`Cache not found for ${fileName}, fetching...`)
        } else {
            console.error(`Error reading cache: ${e}`)
        }

        // The rest of your script remains the same.
        const context = await browser.createBrowserContext()
        const page = await context.newPage()
        // await page.setRequestInterception(true)

        const responseContents: string[] = []

        const responsePromise = new Promise<void>((resolve) => {
            console.log('Waiting for response...')
            page.on('response', async (response) => {
                if (response.url().includes(targetUri)) {
                    console.log('Catched!')
                    const content = await response.text()
                    responseContents.push(content)
                    resolve()
                }
            })
        })

        console.log(`Navigating to ${entryPoint}...`)

        await page.goto(entryPoint, {
            waitUntil: 'networkidle2',
        })

        if (action) {
            console.log('Performing action...')
            await action(page)
        }

        await responsePromise

        await page.close()
        await context.close()

        // Save the content to the cache.
        await Deno.mkdir(CACHE_DIR, { recursive: true })
        await Deno.writeTextFile(
            `${CACHE_DIR}/${fileName}`,
            JSON.stringify(responseContents),
        )

        console.log(`Cache created for ${fileName}`)

        return responseContents
    }
}

export default cachedCrawl

export async function closeBrowser() {
    await browser.close()
    console.log('Browser closed')
}
