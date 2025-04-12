import { closeBrowser } from './common/cached-fetch.ts'
import { getRoutePlans } from './kobus/get-route-plans.ts'
import { getTerminals } from './kobus/get-terminals.ts'

const { routes, terminals } = await getTerminals()

console.log(
    terminals.get(routes[0].departureTerminalId)!,
    terminals.get(routes[0].arrivalTerminalId)!,
)

await getRoutePlans(
    terminals.get(routes[0].departureTerminalId)!,
    terminals.get(routes[0].arrivalTerminalId)!,
)

await closeBrowser()
