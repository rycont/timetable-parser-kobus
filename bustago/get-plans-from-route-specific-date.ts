import { cachedFetch } from '../cache-functions/cached-fetch.ts'
import { cacher } from '../cache-functions/cacher.ts'
import { CannotFetchPastDateError } from '../error-signals/fetch-operation.ts'
import { rawOperationScheme } from './scheme/operation.ts'

const URI = 'https://www.bustago.or.kr/newweb/kr/ticket/ticketListJson3.do'

export default async function getPlansFromRouteInSpecificDate(props: {
    departureTerminalId: string
    arrivalTerminalId: string
    date: Date
}) {
    const requestBody = new URLSearchParams()

    const dateStringParts = [
        props.date.getFullYear(),
        String(props.date.getMonth() + 1).padStart(2, '0'),
        String(props.date.getDate()).padStart(2, '0'),
    ]

    const dateString = dateStringParts.join('')
    const dateStringWithDash = dateStringParts.join('-')

    const cacheKey = `${dateStringWithDash}-bustago-plans-${props.departureTerminalId}-${props.arrivalTerminalId}.json`
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (props.date < today) {
        const cached = await cacher(cacheKey, false)

        if (!cached.hit) {
            throw new CannotFetchPastDateError()
        }

        const operations = rawOperationScheme.parse(JSON.parse(cached.data))

        return {
            data: operations,
            fresh: false,
        }
    }

    requestBody.append('startType', 'S')
    requestBody.append('orderDate', dateString)
    requestBody.append('orderBackDate', dateString)
    requestBody.append('depTerId', props.departureTerminalId)
    requestBody.append('arrTerId', props.arrivalTerminalId)
    requestBody.append('depTime', '0000')
    requestBody.append('arrTime', '0000')
    requestBody.append('goBusGrade', '')
    requestBody.append('goBackBusGrade', '')

    try {
        const cachedResponse = await cachedFetch(
            cacheKey,
            URI,
            {
                method: 'POST',
                headers: {
                    'content-type':
                        'application/x-www-form-urlencoded; charset=UTF-8',
                },
                body: requestBody,
            },
            false,
            14,
        )

        const operations = rawOperationScheme.parse(
            JSON.parse(cachedResponse.data),
        )
        return {
            data: operations,
            fresh: !cachedResponse.cached,
        }
    } catch (error) {
        console.error('Error fetching plans:', error)
        return {
            data: [],
            fresh: false,
        }
    }
}

if (import.meta.main) {
    const departureTerminalId =
        prompt('Enter departure terminal ID: ') || '0001'
    const arrivalTerminalId = prompt('Enter arrival terminal ID: ') || '1001'

    const date = new Date()
    date.setDate(date.getDate() - 1)

    const plans = await getPlansFromRouteInSpecificDate({
        departureTerminalId,
        arrivalTerminalId,
        date,
    })

    console.log(
        `Plans from ${departureTerminalId} to ${arrivalTerminalId} on ${
            date.toISOString().split('T')[0]
        }:`,
    )

    console.table(plans.data, [
        'BUS_ROUTE_ID',
        'DEP_DATE',
        'DEP_TIME',
        'FARE2',
        'FARE3',
    ])
}
