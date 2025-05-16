import { closeBrowser } from './common/cached-crawl.ts'

import { getRoutePlans as getKobusRoutePlans } from './kobus/get-route-plans/index.ts'
import { getTerminals as getKobusTerminals } from './kobus/get-terminals.ts'

const { routes, terminals } = await getKobusTerminals()
const SAMPLES = parseInt(Deno.env.get('UPDATE_SAMPLES') ?? '20', 10)

const sampledRoutes = routes
    .toSorted(() => Math.random() - 0.5)
    .slice(0, SAMPLES)

for (const route of sampledRoutes) {
    const departureTerminal = terminals.get(route.departureTerminalId)!
    const arrivalTerminal = terminals.get(route.arrivalTerminalId)!

    await getKobusRoutePlans(departureTerminal, arrivalTerminal)
}

await closeBrowser()
