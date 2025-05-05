import { cachedFetch } from '../common/cached-fetch.ts'
import { Terminal } from '../common/scheme/terminal.ts'
import { rawEndTerminalScheme } from './scheme/terminal.ts'

function createURI(terminalId: string) {
    return `https://www.bustago.or.kr/newweb/kr/common/terminalEndListAjax.do?area=&country=&terCode=${terminalId}`
}

export async function getRoutesFromTerminal(
    terminalId: string,
): Promise<Terminal[]> {
    const rawEndTerminals = await cachedFetch(
        `bustago-route-from-${terminalId}.json`,
        createURI(terminalId),
        {
            method: 'POST',
        },
    )

    const endTerminals = rawEndTerminalScheme.parse(JSON.parse(rawEndTerminals))
    return endTerminals
}
