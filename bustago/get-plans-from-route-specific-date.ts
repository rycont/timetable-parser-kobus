import { cachedFetch } from '../common/cached-fetch.ts'
import { rawOperationScheme } from './scheme/operation.ts'

const URI = 'https://www.bustago.or.kr/newweb/kr/ticket/ticketListJson3.do'

export default async function getPlansFromRouteInSpecificDate(
    departureTerminalId: string,
    arrivalTerminalId: string,
    date: Date,
) {
    const requestBody = new URLSearchParams()
    const dateString = `${date.getFullYear()}${String(
        date.getMonth() + 1,
    ).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`

    requestBody.append('startType', 'S')
    requestBody.append('orderDate', dateString)
    requestBody.append('orderBackDate', dateString)
    requestBody.append('depTerId', departureTerminalId)
    requestBody.append('arrTerId', arrivalTerminalId)
    requestBody.append('depTime', '0000')
    requestBody.append('arrTime', '0000')
    requestBody.append('goBusGrade', '')
    requestBody.append('goBackBusGrade', '')

    const cacheKey = `bustago-plans-${departureTerminalId}-${arrivalTerminalId}-${dateString}.json`

    const cachedResponse = await cachedFetch(cacheKey, URI, {
        method: 'POST',
        headers: {
            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
        body: requestBody,
    })

    const operations = rawOperationScheme.parse(JSON.parse(cachedResponse.data))
    return {
        data: operations,
        fresh: !cachedResponse.cached,
    }
}
