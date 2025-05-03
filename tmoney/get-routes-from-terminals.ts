import { cachedFetch } from '../common/cached-fetch.ts'
import saveData from '../common/save-data.ts'
import { PREFIX } from '../const.ts'
import { rawTmoneyTerminalScheme } from './scheme/terminal.ts'

const API_URL = 'https://txbus.t-money.co.kr/otck/readTrmlList.do'

export async function getRoutesFromTerminals(terminalCode: string) {
    if (!terminalCode.startsWith(PREFIX.TMONEY)) {
        throw new Error(
            'Tmoney Network Terminal Code must start with ' + PREFIX.TMONEY,
        )
    }

    const CACHE_NAME = `tmoney-route-from-${terminalCode}.json`

    const formData = new FormData()

    formData.append('cty_Bus_Area_Cd', '')
    formData.append('trml_Nm', '')
    formData.append('pre_Trml_Cd', terminalCode.slice(PREFIX.TMONEY.length))
    formData.append('rtnGbn', '02')

    const rawTargetTerminals = JSON.parse(
        await cachedFetch(CACHE_NAME, API_URL, {
            method: 'POST',
            body: formData,
        }),
    )

    const targetTerminals = rawTmoneyTerminalScheme
        .array()
        .parse(rawTargetTerminals)

    const routes = targetTerminals.map((terminal) => ({
        departureTerminalId: terminalCode,
        arrivalTerminalId: terminal.id,
    }))

    await saveData(
        'tmoney',
        `routes-from-${terminalCode}`,
        JSON.stringify(routes, null, 2),
    )

    return routes
}
