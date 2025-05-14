import { getPlansFromRoute } from './bustago/get-plans-from-route.ts'
import { getRoutesFromTerminal } from './bustago/get-routes-from-terminal.ts'
import { getTerminals } from './bustago/get-terminals.ts'

const terminals = [...(await getTerminals()).values()].toSorted(
    () => 0.5 - Math.random(),
)

let i = 1

const parsingFinishedRoutes = await getAlreadyParsedRoutes()

for (const departingTerminal of terminals) {
    const { data: routes } = await getRoutesFromTerminal(departingTerminal.id)
    console.log(`----- ${i++} / ${terminals.length} -----`)

    let j = 0

    for (const arrivalTerminal of routes) {
        const routeId = `${departingTerminal.id}-${arrivalTerminal.id}`

        j++
        // if (parsingFinishedRoutes.has(routeId)) {
        //     console.log(`Already parsed ${routeId}`)
        //     continue
        // }

        console.log(
            `----- ${j} of ${routes.length} in ${departingTerminal.name}(${departingTerminal.id}, ${i} of ${terminals.length}) -----`,
        )
        console.log(
            `Arrival Terminal: ${arrivalTerminal.name}(${arrivalTerminal.id})`,
        )
        console.log(
            await getPlansFromRoute(departingTerminal.id, arrivalTerminal.id),
        )
    }
}

async function getAlreadyParsedRoutes() {
    const routes = new Set<string>()

    for await (const entry of Deno.readDir('./bustago-output/timetable')) {
        if (entry.isFile) {
            const name = entry.name
            if (name.includes('metadata')) {
                continue
            }

            routes.add(name.split('.')[0])
        }
    }

    return routes
}
