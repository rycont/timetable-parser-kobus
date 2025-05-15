const fileNames = []
const cacheDir = './cache'

for await (const dirEntry of Deno.readDir(cacheDir)) {
    if (dirEntry.isFile) {
        fileNames.push(dirEntry.name)
    }
}

const REGEX_YYYY_MM_DD = /(\d{4})-(\d{2})-(\d{2})/

for (const fileName of fileNames) {
    const prefix = fileName.slice(0, 10)
    const match = prefix.match(REGEX_YYYY_MM_DD)

    if (match) {
        continue
    }
    if (fileName.startsWith('bustago-plans-')) {
        const dateWithoutDash = fileName.slice(-13, -5)
        const dateWithDash = `${dateWithoutDash.slice(
            0,
            4,
        )}-${dateWithoutDash.slice(4, 6)}-${dateWithoutDash.slice(6, 8)}`
        const rename = dateWithDash + '-' + fileName.slice(0, -14) + '.json'

        console.log('Renaming', fileName, 'to', rename)
        await Deno.rename(`${cacheDir}/${fileName}`, `${cacheDir}/${rename}`)

        continue
    }

    if (
        fileName.startsWith('bustago-route-from-') ||
        fileName === 'bustago-terminals.json'
    ) {
        const today = new Date()
        const todayWithDash = `${today.getFullYear()}-${String(
            today.getMonth() + 1,
        ).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

        const rename = todayWithDash + '-' + fileName
        console.log('Renaming', fileName, 'to', rename)
        await Deno.rename(`${cacheDir}/${fileName}`, `${cacheDir}/${rename}`)

        continue
    }

    console.log(fileName)

    throw ''
}
