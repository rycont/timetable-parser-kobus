import { cachedFetch } from '../cache-functions/cached-fetch.ts'
import saveData from '../common/save-data.ts'
import { Terminal } from '../common/scheme/terminal.ts'
import { PREFIX } from '../const.ts'
import { rawTmoneyTerminalParser } from './scheme/terminal.ts'

const API_URL = 'https://txbus.t-money.co.kr/otck/readTrmlList.do'

export async function getRoutesFromTerminals(terminalCode: string) {
    if (!terminalCode.startsWith(PREFIX.TMONEY)) {
        throw new Error(
            'Tmoney Network Terminal Code must start with ' + PREFIX.TMONEY,
        )
    }

    const CACHE_NAME = `tmoney-route-from-${terminalCode}.json`

    const formData = new URLSearchParams()

    formData.append('cty_Bus_Area_Cd', '')
    formData.append('trml_Nm', '')
    formData.append('pre_Trml_Cd', terminalCode.slice(PREFIX.TMONEY.length))
    formData.append('rtnGbn', '02')

    const targetTerminalCache = await cachedFetch(CACHE_NAME, API_URL, {
        method: 'POST',
        body: formData,
    })

    const rawTargetTerminals = JSON.parse(targetTerminalCache.data)

    const targetTerminals = rawTmoneyTerminalParser.parse(rawTargetTerminals)

    if (!targetTerminalCache.cached) {
        await saveData(
            'tmoney',
            `target-terminals-from-${terminalCode}`,
            JSON.stringify(targetTerminals, null, 2),
        )
    }

    const targetTerminalMap = new Map<string, Terminal>(
        targetTerminals.map((terminal) => [terminal.id, terminal]),
    )

    return targetTerminalMap
}
