import { closeBrowser } from './common/cached-crawl.ts'

import { getRoutePlans as getKobusRoutePlans } from './kobus/get-route-plans/index.ts'
import { getTerminals as getKobusTerminals } from './kobus/get-terminals.ts'

const { routes, terminals } = await getKobusTerminals()

let progress = 1

for (const route of routes) {
    console.log(
        '[KOBUS] %s -> %s (%d / %d)',
        route.departureTerminalId,
        route.arrivalTerminalId,
        progress++,
        routes.length,
    )

    const departureTerminal = terminals.get(route.departureTerminalId)!
    const arrivalTerminal = terminals.get(route.arrivalTerminalId)!

    await getKobusRoutePlans(departureTerminal, arrivalTerminal)
}

await closeBrowser()
