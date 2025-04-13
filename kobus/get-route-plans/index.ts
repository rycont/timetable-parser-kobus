import {
    normalizedPlanScheme,
    rawPlanListResponseScheme,
} from '../types/plan-raw.ts'
import { Terminal } from '../types/terminal.ts'
import { fetchKobusPlans } from './crawl.ts'
import { mergePlans } from './merge-plans.ts'

export async function getRoutePlans(
    departureTerminal: Terminal,
    arrivalTerminal: Terminal,
) {
    const rawResult = await fetchKobusPlans(departureTerminal, arrivalTerminal)

    const timetableByDate = rawResult.map((item) =>
        rawPlanListResponseScheme.parse(JSON.parse(item)),
    )

    const mergedPlans = normalizedPlanScheme
        .array()
        .parse(mergePlans(timetableByDate.flat()))

    return mergedPlans
}
