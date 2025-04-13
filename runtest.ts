import { closeBrowser } from './common/cached-fetch.ts'
import { getRoutePlans } from './kobus/get-route-plans/index.ts'
import { getTerminals } from './kobus/get-terminals.ts'

const { routes, terminals } = await getTerminals()

console.log(
    terminals.get(routes[705].departureTerminalId)!,
    terminals.get(routes[705].arrivalTerminalId)!,
)

console.log(
    await getRoutePlans(
        terminals.get(routes[705].departureTerminalId)!,
        terminals.get(routes[705].arrivalTerminalId)!,
    ),
)

await closeBrowser()
