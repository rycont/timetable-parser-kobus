import { cachedFetch } from '../common/cached-fetch.ts'
import saveData from '../common/save-data.ts'
import { rawTmoneyTerminalScheme } from './scheme/terminal.ts'

const CACHE_NAME = 'tmoney-terminals.json'
const TERMINAL_JSON_URL = 'https://txbus.t-money.co.kr/otck/readTrmlList.do'

export async function getTerminals() {
    const formData = new FormData()

    formData.append('cty_Bus_Area_Cd', '')
    formData.append('trml_Nm', '')
    formData.append('pre_Trml_Cd', '')
    formData.append('rtnGbn', '02')

    const rawTerminals = JSON.parse(
        await cachedFetch(CACHE_NAME, TERMINAL_JSON_URL, {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-Requested-With': 'XMLHttpRequest',
            },
        }),
    )

    const terminals = rawTmoneyTerminalScheme.array().parse(rawTerminals)
    await saveData('tmoney', 'terminals', JSON.stringify(terminals, null, 2))

    return terminals
}
