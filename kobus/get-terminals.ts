import { cachedCrawl } from '../cache-functions/cached-crawl.ts'
import saveData from '../common/save-data.ts'
import { Terminal } from '../common/scheme/terminal.ts'
import { rawRouteResponseScheme } from './types/terminal-raw.ts'
import { Route } from './types/terminal.ts'

export async function getTerminals() {
    const {
        data: [routesRawString],
        fresh,
    } = await cachedCrawl({
        entryPoint: 'https://www.kobus.co.kr/main.do',
        fileName: `kobus-terminals.json`,
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

    const terminals = Array.from(terminalsMap.values()).toSorted((a, b) =>
        a.id > b.id ? 1 : -1,
    )

    const routes = Array.from(routesMap).toSorted((a, b) =>
        a.departureTerminalId + a.arrivalTerminalId >
        b.departureTerminalId + b.arrivalTerminalId
            ? 1
            : -1,
    )

    if (fresh) {
        await saveData('kobus', 'terminals', JSON.stringify(terminals, null, 2))
        await saveData('kobus', 'connections', JSON.stringify(routes, null, 2))
    }

    return {
        terminals: terminalsMap,
        routes: Array.from(routesMap),
    }
}
