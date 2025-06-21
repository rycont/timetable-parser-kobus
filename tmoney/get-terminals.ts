import { cachedFetch } from '../cache-functions/cached-fetch.ts'
import saveData from '../common/save-data.ts'
import { Terminal } from '../common/scheme/terminal.ts'
import { rawTmoneyTerminalParser } from './scheme/terminal.ts'

const CACHE_NAME = 'tmoney-terminals.json'
const TERMINAL_JSON_URL = 'https://txbus.t-money.co.kr/otck/readTrmlList.do'

export async function getDepartingTerminals() {
    const formData = new URLSearchParams()

    formData.append('cty_Bus_Area_Cd', '')
    formData.append('trml_Nm', '')
    formData.append('pre_Trml_Cd', '')
    formData.append('rtnGbn', '02')

    const rawTerminalCache = await cachedFetch(CACHE_NAME, TERMINAL_JSON_URL, {
        method: 'POST',
        body: formData,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-Requested-With': 'XMLHttpRequest',
        },
    })

    const rawTerminals = JSON.parse(rawTerminalCache.data)

    const terminals = rawTmoneyTerminalParser.parse(rawTerminals)

    if (!rawTerminalCache.cached) {
        await saveData(
            'tmoney',
            'terminals',
            JSON.stringify(terminals, null, 2),
        )
    }

    const terminalMap = new Map<string, Terminal>(
        terminals.map((terminal) => [terminal.id, terminal]),
    )

    return terminalMap
}
