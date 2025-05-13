import { getPlansFromRoute } from './bustago/get-plans-from-route.ts'
import { getRoutesFromTerminal } from './bustago/get-routes-from-terminal.ts'
import { getTerminals } from './bustago/get-terminals.ts'

const terminals = [...(await getTerminals()).values()].toSorted(
    () => 0.5 - Math.random(),
)

let i = 1

for (const departingTerminal of terminals) {
    const { data: routes } = await getRoutesFromTerminal(departingTerminal.id)
    console.log(`----- ${i++} / ${terminals.length} -----`)

    let j = 1

    for (const arrivalTerminal of routes) {
        console.log(
            `----- ${j++} of ${routes.length} in ${departingTerminal.name}(${
                departingTerminal.id
            }, ${i} of ${terminals.length}) -----`,
        )
        console.log(
            `Arrival Terminal: ${arrivalTerminal.name}(${arrivalTerminal.id})`,
        )
        console.log(
            await getPlansFromRoute(departingTerminal.id, arrivalTerminal.id),
        )
    }
}
