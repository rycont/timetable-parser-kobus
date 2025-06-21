import { closeBrowser } from './cache-functions/cached-crawl.ts'

import { getRoutePlans as getKobusRoutePlans } from './kobus/get-route-plans/index.ts'
import { getTerminals as getKobusTerminals } from './kobus/get-terminals.ts'

import removeOldCaches from './remove-old-caches.ts'
import { getTerminals as getBustagoTerminals } from './bustago/get-terminals.ts'
import { getRoutesFromTerminal as getBustagoRoutesFromTerminal } from './bustago/get-routes-from-terminal.ts'
import { getPlansFromRoute as getBustagoPlansFromRoute } from './bustago/get-plans-from-route.ts'

const SAMPLES = parseInt(Deno.env.get('UPDATE_SAMPLES') ?? '20', 10)

async function updateKobus() {
    console.time('Kobus: Sampling update')

    const { routes, terminals } = await getKobusTerminals()
    const sampledRoutes = routes
        .toSorted(() => Math.random() - 0.5)
        .slice(0, SAMPLES)

    for (const route of sampledRoutes) {
        const departureTerminal = terminals.get(route.departureTerminalId)!
        const arrivalTerminal = terminals.get(route.arrivalTerminalId)!
        await getKobusRoutePlans(departureTerminal, arrivalTerminal)
    }

    await closeBrowser()
    console.timeEnd('Kobus: Sampling update')
}

async function updateBustago() {
    console.time('Bustago: Sampling update')
    const terminals = [...(await getBustagoTerminals()).values()]
    const randomTerminals = terminals
        .toSorted(() => Math.random() - 0.5)
        .slice(0, 4)

    for (const departingTerminal of randomTerminals) {
        const { data: routes } = await getBustagoRoutesFromTerminal(
            departingTerminal.id,
        )
        const sampledRoutes = routes
            .toSorted(() => Math.random() - 0.5)
            .slice(0, SAMPLES / 2)

        for (const arrivingTerminal of sampledRoutes) {
            await getBustagoPlansFromRoute(
                departingTerminal.id,
                arrivingTerminal.id,
            )
        }
    }
    console.timeEnd('Bustago: Sampling update')
}

await Promise.all([updateKobus(), updateBustago()])

await removeOldCaches()
