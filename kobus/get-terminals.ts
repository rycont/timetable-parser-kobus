import cachedCrawl from '../common/cached-fetch.ts'
import { rawRouteResponseScheme } from './types/terminal-raw.ts'
import { Route, Terminal } from './types/terminal.ts'

export async function getTerminals() {
    const [routesRawString] = await cachedCrawl({
        entryPoint: 'https://www.kobus.co.kr/main.do',
        fileName: 'kobus-terminals.json',
        targetUri: 'https://www.kobus.co.kr/mrs/readRotLinInf.ajax',
    })

    const rawRoutes = rawRouteResponseScheme.parse(JSON.parse(routesRawString))

    const terminalsMap: Map<string, Terminal> = new Map()
    const routesMap: Set<Route> = new Set()

    for (const rawRoute of rawRoutes.rotInfList) {
        const departureTerminalId = rawRoute.deprCd
        const arrivalTerminalId = rawRoute.arvlCd
        const duration = rawRoute.takeTime

        routesMap.add({
            departureTerminalId,
            arrivalTerminalId,
            durationInMinutes: duration,
        })

        if (!terminalsMap.has(departureTerminalId)) {
            terminalsMap.set(departureTerminalId, {
                id: departureTerminalId,
                name: rawRoute.deprNm,
                area: rawRoute.deprArea,
            })
        }

        if (!terminalsMap.has(arrivalTerminalId)) {
            terminalsMap.set(arrivalTerminalId, {
                id: arrivalTerminalId,
                name: rawRoute.arvlNm,
                area: rawRoute.arvlArea,
            })
        }
    }

    await Deno.writeTextFile(
        './output/terminals.json',
        JSON.stringify([...terminalsMap.values()], null, 2),
    )

    await Deno.writeTextFile(
        './output/connections.json',
        JSON.stringify(Array.from(routesMap), null, 2),
    )

    return {
        terminals: terminalsMap,
        routes: Array.from(routesMap),
    }
}
