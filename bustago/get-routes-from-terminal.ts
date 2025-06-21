import { cachedFetch } from '../cache-functions/cached-fetch.ts'
import { Terminal } from '../common/scheme/terminal.ts'
import { rawEndTerminalScheme } from './scheme/terminal.ts'

function createURI(terminalId: string) {
    return `https://www.bustago.or.kr/newweb/kr/common/terminalEndListAjax.do?area=&country=&terCode=${terminalId}`
}

export async function getRoutesFromTerminal(terminalId: string): Promise<{
    data: Terminal[]
    cached: boolean
}> {
    const rawEndTerminals = await cachedFetch(
        `bustago-route-from-${terminalId}.json`,
        createURI(terminalId),
        {
            method: 'POST',
        },
    )

    const endTerminals = rawEndTerminalScheme.parse(
        JSON.parse(rawEndTerminals.data),
    )

    return {
        data: endTerminals,
        cached: rawEndTerminals.cached,
    }
}
