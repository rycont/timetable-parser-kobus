import { closeBrowser } from './common/cached-fetch.ts'
import { getRoutePlans } from './kobus/get-route-plans/index.ts'
import { getTerminals } from './kobus/get-terminals.ts'

const { routes, terminals } = await getTerminals()

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

    console.table(
        (
            await getRoutePlans(
                terminals.get(route.departureTerminalId)!,
                terminals.get(route.arrivalTerminalId)!,
            )
        ).map((plan) => ({
            '출발 시간':
                plan.departureTime.hour.toString().padStart(2, '0') +
                ':' +
                plan.departureTime.minute.toString().padStart(2, '0'),
            운임: plan.fare.어른,
            소요시간: plan.durationInMinutes,
            등급: plan.busClass,
            운행사: plan.operator,
        })),
    )
}

await getPlansFromRoute(routes[5])

// for (const route of routes) {
//     await getPlansFromRoute(route)
//     await new Promise((resolve) => setTimeout(resolve, 3000))
// }

await closeBrowser()
