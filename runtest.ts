import { closeBrowser } from './common/cached-crawl.ts'
import { getRoutePlans } from './kobus/get-route-plans/index.ts'
import { getTerminals } from './kobus/get-terminals.ts'

const { terminals } = await getTerminals()

async function getPlansFromRoute(route: {
    departureTerminalId: string
    arrivalTerminalId: string
}) {
    const plans = await getRoutePlans(
        terminals.get(route.departureTerminalId)!,
        terminals.get(route.arrivalTerminalId)!,
    )

    console.log(plans)
}

await getPlansFromRoute({
    departureTerminalId: '100',
    arrivalTerminalId: '615',
})

await closeBrowser()
