import { getPlansFromRoute } from './tmoney/get-plans-from-route/index.ts'
import { getRoutesFromTerminals } from './tmoney/get-routes-from-terminals.ts'
import { getDepartingTerminals } from './tmoney/get-terminals.ts'

const departingTerminals = await getDepartingTerminals()
const departingTerminal = departingTerminals.get('t-2401401')!

const routes = await getRoutesFromTerminals(departingTerminal.id)
const arrivalTerminal = routes.values().drop(3).next().value!

console.log('-----')

console.log(
    `Departure Terminal: ${departingTerminal.name}(${departingTerminal.id})`,
)
console.log(`Arrival Terminal: ${arrivalTerminal.name}(${arrivalTerminal.id})`)

const plans = await getPlansFromRoute(departingTerminal, arrivalTerminal)
