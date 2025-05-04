import { DOMParser } from 'jsr:@b-fuze/deno-dom'
import { cachedFetch } from '../../common/cached-fetch.ts'

const URI = 'https://intercitybus.tmoney.co.kr/runinf/runInf.do'

export default async function getServerDate() {
    const text = await cachedFetch('tmoney-run-information.json', URI)
    const dom = new DOMParser().parseFromString(text, 'text/html')
    const serverDateYYYYMMDD = dom
        .getElementById('depr_Dt')
        ?.getAttribute('value')

    const [yyyy, mm, dd] = serverDateYYYYMMDD?.split('-') ?? []
    const serverDate = new Date(Number(yyyy), Number(mm) - 1, Number(dd))

    if (isNaN(serverDate.getTime())) {
        throw new Error('Invalid server date')
    }

    serverDate.setHours(0, 0, 0, 0)
    serverDate.setMilliseconds(0)

    return serverDate
}
