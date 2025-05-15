import { getPlansFromRoute } from './bustago/get-plans-from-route.ts'
import { getRoutesFromTerminal } from './bustago/get-routes-from-terminal.ts'
import { getTerminals } from './bustago/get-terminals.ts'

const terminals = [...(await getTerminals()).values()].toSorted(
    () => 0.5 - Math.random(),
)

let allRoutes = 0

for (const terminal of terminals) {
    const avaliableRoutes = await getRoutesFromTerminal(terminal.id)
    allRoutes += avaliableRoutes.data.length
}

let j = 0

for (const departingTerminal of terminals) {
    const { data: routes } = await getRoutesFromTerminal(departingTerminal.id)

    for (const arrivalTerminal of routes) {
        // const routeId = `${departingTerminal.id}-${arrivalTerminal.id}`

        j++
        // if (parsingFinishedRoutes.has(routeId)) {
        //     console.log(`Already parsed ${routeId}`)
        //     continue
        // }

        // console.log(
        //     `----- ${j} of ${routes.length} in ${departingTerminal.name}(${departingTerminal.id}, ${i} of ${terminals.length}) -----`,
        // )
        // console.log(
        //     `Arrival Terminal: ${arrivalTerminal.name}(${arrivalTerminal.id})`,
        // )
        console.log(
            `[BUSTAGO] ${j} / ${allRoutes} (${departingTerminal.name}(${departingTerminal.id}) -> ${arrivalTerminal.name}(${arrivalTerminal.id}))`,
        )
        await getPlansFromRoute(departingTerminal.id, arrivalTerminal.id)
    }
}
