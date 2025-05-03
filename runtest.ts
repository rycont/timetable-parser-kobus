import { getRoutesFromTerminals } from './tmoney/get-routes-from-terminals.ts'
import { getTerminals } from './tmoney/get-terminals.ts'

const terminals = await getTerminals()
const routes = await getRoutesFromTerminals(terminals[100].id)

console.log(terminals[100], routes)
