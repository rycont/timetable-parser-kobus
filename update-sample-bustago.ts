import { getTerminals as getBustagoTerminals } from './bustago/get-terminals.ts'
import { getRoutesFromTerminal as getBustagoRoutesFromTerminal } from './bustago/get-routes-from-terminal.ts'
import { getPlansFromRoute as getBustagoPlansFromRoute } from './bustago/get-plans-from-route.ts'

const SAMPLES = parseInt(Deno.env.get('UPDATE_SAMPLES') ?? '20', 10)

const terminals = [...(await getBustagoTerminals()).values()]

for (let i = 0; i < SAMPLES; i++) {
    const departingTerminal =
        terminals[Math.floor(Math.random() * terminals.length)]
    const { data: routes } = await getBustagoRoutesFromTerminal(
        departingTerminal.id,
    )
    const arrivingTerminal = routes[Math.floor(Math.random() * routes.length)]
    await getBustagoPlansFromRoute(departingTerminal.id, arrivingTerminal.id)
}
