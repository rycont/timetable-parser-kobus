import { getTerminals as getBustagoTerminals } from './bustago/get-terminals.ts'
import { getRoutesFromTerminal as getBustagoRoutesFromTerminal } from './bustago/get-routes-from-terminal.ts'
import { getPlansFromRoute as getBustagoPlansFromRoute } from './bustago/get-plans-from-route.ts'
import { Route } from './common/scheme/operation.ts'

const SAMPLES = parseInt(Deno.env.get('UPDATE_SAMPLES') ?? '20', 10)

const terminals = [...(await getBustagoTerminals()).values()]
const routes: Route[] = []

for (const terminal of terminals) {
    const { data } = await getBustagoRoutesFromTerminal(terminal.id)
    for (const route of data) {
        routes.push({
            departureTerminalId: terminal.id,
            arrivalTerminalId: route.id,
            durationInMinutes: -1,
        })
    }
}

const sampledRoutes = routes.slice(0, SAMPLES)

for (const route of sampledRoutes) {
    await getBustagoPlansFromRoute(
        route.departureTerminalId,
        route.arrivalTerminalId,
    )
}
