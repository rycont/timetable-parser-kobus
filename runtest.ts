import { getPlansFromRoute } from './bustago/get-plans-from-route.ts'
import { getRoutesFromTerminal } from './bustago/get-routes-from-terminal.ts'
import { getTerminals } from './bustago/get-terminals.ts'

const terminals = await getTerminals()

for (const departingTerminal of terminals.values()) {
    const routes = await getRoutesFromTerminal(departingTerminal.id)

    for (const arrivalTerminal of routes) {
        console.log('-----')
        console.log(
            `Departure Terminal: ${departingTerminal.name}(${departingTerminal.id})`,
        )
        console.log(
            `Arrival Terminal: ${arrivalTerminal.name}(${arrivalTerminal.id})`,
        )
        console.log('-----')
        console.log(
            await getPlansFromRoute(departingTerminal.id, arrivalTerminal.id),
        )
    }
}
