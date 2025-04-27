import { closeBrowser } from './common/cached-crawl.ts'
import { getRoutePlans } from './kobus/get-route-plans/index.ts'
import { getTerminals } from './kobus/get-terminals.ts'

const { routes, terminals } = await getTerminals()

const SAMPLES = 20
const sampledRoutes = routes.toSorted(() => Math.random() - 0.5).slice(0, 20)

let progress = 1

for (const route of sampledRoutes) {
    console.log(
        `${progress++}/${SAMPLES} Fetching route plans for ${
            route.departureTerminalId
        } -> ${route.arrivalTerminalId}`,
    )

    const departureTerminal = terminals.get(route.departureTerminalId)!
    const arrivalTerminal = terminals.get(route.arrivalTerminalId)!

    await getRoutePlans(departureTerminal, arrivalTerminal)
}

await closeBrowser()
console.log('Done!')
