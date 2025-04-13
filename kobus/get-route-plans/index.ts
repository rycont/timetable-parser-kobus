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

    const timetableByDate = rawResult
        .map((item) => rawPlanListResponseScheme.parse(JSON.parse(item)))
        .filter((item) => item.length > 0)

    const mergedPlans = normalizedPlanScheme
        .array()
        .parse(mergePlans(timetableByDate.flat(), timetableByDate.length))

    await Deno.writeTextFile(
        `./output/timetable/${departureTerminal.id}-${arrivalTerminal.id}.json`,
        JSON.stringify(mergedPlans, null, 2),
    )

    return mergedPlans
}
