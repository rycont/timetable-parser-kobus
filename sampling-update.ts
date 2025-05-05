import { closeBrowser } from './common/cached-crawl.ts'

import { getRoutePlans as getKobusRoutePlans } from './kobus/get-route-plans/index.ts'
import { getTerminals as getKobusTerminals } from './kobus/get-terminals.ts'

import removeOldCaches from './remove-old-caches.ts'
import { getTerminals as getBustagoTerminals } from './bustago/get-terminals.ts'
import { getRoutesFromTerminal as getBustagoRoutesFromTerminal } from './bustago/get-routes-from-terminal.ts'
import { getPlansFromRoute as getBustagoPlansFromRoute } from './bustago/get-plans-from-route.ts'

const SAMPLES = parseInt(Deno.env.get('UPDATE_SAMPLES') ?? '20', 10)

async function updateKobus() {
    const { routes, terminals } = await getKobusTerminals()
    const sampledRoutes = routes
        .toSorted(() => Math.random() - 0.5)
        .slice(0, SAMPLES)

    let progress = 1

    for (const route of sampledRoutes) {
        console.log(
            '[KOBUS] %s -> %s (%d / %d)',
            route.departureTerminalId,
            route.arrivalTerminalId,
            progress++,
            SAMPLES,
        )

        const departureTerminal = terminals.get(route.departureTerminalId)!
        const arrivalTerminal = terminals.get(route.arrivalTerminalId)!

        await getKobusRoutePlans(departureTerminal, arrivalTerminal)
    }

    await closeBrowser()
    console.log('Kobus Updated!')
}

async function updateBustago() {
    const terminals = [...(await getBustagoTerminals()).values()]
    const randomTerminals = terminals
        .toSorted(() => Math.random() - 0.5)
        .slice(0, 4)

    let progress = 1

    for (const departingTerminal of randomTerminals) {
        const routes = await getBustagoRoutesFromTerminal(departingTerminal.id)
        const sampledRoutes = routes
            .toSorted(() => Math.random() - 0.5)
            .slice(0, SAMPLES / 4)

        for (const arrivingTerminal of sampledRoutes) {
            console.log(
                '[BUSTAGO] %s -> %s (%d / %d)',
                departingTerminal.name,
                arrivingTerminal.name,
                progress++,
                sampledRoutes.length * randomTerminals.length,
            )
            await getBustagoPlansFromRoute(
                departingTerminal.id,
                arrivingTerminal.id,
            )
        }
    }
}

await Promise.all([updateKobus(), updateBustago()])

// await removeOldCaches()

