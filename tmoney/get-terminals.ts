import { cachedFetch } from '../common/cached-fetch.ts'

const CACHE_NAME = 'tmoney-terminals.json'
const TERMINAL_JSON_URL = 'https://txbus.t-money.co.kr/otck/readTrmlList.do'

export async function getTerminals() {
    // cty_Bus_Area_Cd=&trml_Nm=&pre_Trml_Cd=&rtnGbn=01

    const queryString = new URLSearchParams({
        cty_Bus_Area_Cd: '',
        trml_Nm: '',
        pre_Trml_Cd: '',
        rtnGbn: '',
    })

    const rawTerminals = JSON.parse(
        await cachedFetch(CACHE_NAME, TERMINAL_JSON_URL + '?' + queryString, {
            method: 'POST',
        }),
    )

    console.log(rawTerminals)
}
