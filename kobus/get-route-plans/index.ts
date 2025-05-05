import saveData from '../../common/save-data.ts'
import { rawPlanListResponseScheme } from '../types/plan-raw.ts'
import { fetchKobusPlans } from './crawl.ts'
import { mergePlans } from '../../common/merge-plans.ts'
import { Terminal } from '../../common/scheme/terminal.ts'
import { normalizedPlanScheme } from '../../common/scheme/operation.ts'

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
        .toSorted(
            (a, b) =>
                a.departureTime.hour * 60 +
                a.departureTime.minute -
                (b.departureTime.hour * 60 + b.departureTime.minute),
        )

    await saveData(
        'kobus',
        `timetable/${departureTerminal.id}-${arrivalTerminal.id}`,
        JSON.stringify(mergedPlans, null, 2),
    )

    return mergedPlans
}
