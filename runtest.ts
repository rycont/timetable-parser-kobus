import { closeBrowser } from './common/cached-fetch.ts'
import { getRoutePlans } from './kobus/get-route-plans/index.ts'
import { getTerminals } from './kobus/get-terminals.ts'
import { OperatingPattern } from './kobus/types/plan-raw.ts'

const { routes, terminals } = await getTerminals()

const daysInKorean = '월화수목금토일'

async function getPlansFromRoute(route: {
    departureTerminalId: string
    arrivalTerminalId: string
    durationInMinutes: number
}) {
    const departureTerminal = terminals.get(route.departureTerminalId)
    const arrivalTerminal = terminals.get(route.arrivalTerminalId)

    console.log(
        "We're travelling from",
        departureTerminal?.name,
        'to',
        arrivalTerminal?.name,
    )

    const plans = await getRoutePlans(
        terminals.get(route.departureTerminalId)!,
        terminals.get(route.arrivalTerminalId)!,
    )

    console.table(
        plans.map((plan) => ({
            '출발 시간':
                plan.departureTime.hour.toString().padStart(2, '0') +
                ':' +
                plan.departureTime.minute.toString().padStart(2, '0'),
            운행요일: formatOperatingPattern(plan.pattern),
        })),
    )
}

for (const route of routes) {
    await getPlansFromRoute(route)
    await new Promise((resolve) => setTimeout(resolve, 100))
}

// await getPlansFromRoute(routes[27])

await closeBrowser()

function formatOperatingPattern(pattern: OperatingPattern) {
    if (pattern.type === 'even-odd') {
        return '격일'
    }

    if (pattern.type === 'everyday') {
        return '매일'
    }

    if (pattern.type === 'specific-day') {
        return formatDays(pattern.days)
    }

    if (pattern.type === 'irregular') {
        const regular = `${formatDays(pattern.fixedDays)}`
        const irregular = `(${formatDays(pattern.irregularDays)} 일부)`

        return `${regular} ${irregular}`
    }
}

function formatDays(days: number[]) {
    return days.map((day) => daysInKorean[day - 1]).join('')
}
