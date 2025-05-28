import { getTerminals as getBustagoTerminals } from './bustago/get-terminals.ts'
import { getRoutesFromTerminal as getBustagoRoutesFromTerminal } from './bustago/get-routes-from-terminal.ts'
import { getPlansFromRoute as getBustagoPlansFromRoute } from './bustago/get-plans-from-route.ts'

const depart = (await getBustagoTerminals()).values().next().value!
const arrive = (await getBustagoRoutesFromTerminal(depart.id)).data[1]

await getBustagoPlansFromRoute(depart.id, arrive.id)
