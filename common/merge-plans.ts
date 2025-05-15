import { determineVariant } from './determine-variant.ts'
import {
    PlannedOperation,
    NormalizedPlan,
    normalizedPlanScheme,
} from './scheme/operation.ts'

export function mergePlans(
    plans: PlannedOperation[],
    parsingWindowSize: number,
) {
    const plansByPlanKey = Object.groupBy(plans, (plan) =>
        [plan.routeId, plan.departureTime.hour, plan.departureTime.minute].join(
            '@',
        ),
    )
    const normalizedPlans = new Map<string, NormalizedPlan>()

    const mergingKeys = [
        'operator',
        'durationInMinutes',
        'stops',
        'routeId',
    ] as const

    for (const planKey in plansByPlanKey) {
        let normalizedPlan: Partial<NormalizedPlan> = {
            type: 'bus',
        }

        const plans = plansByPlanKey[planKey]!

        for (const mergingKey of mergingKeys) {
            const values = plans.map((plan) => plan[mergingKey])
            //@ts-ignore
            normalizedPlan[mergingKey] = mergeValues(values)
        }

        const {
            arrivalTerminalId,
            departureTerminalId,
            departureTime,
            isTemporaryRoute,
        } = plans[0]

        const operatedDates = [...new Set(plans.map((plan) => plan.date))]

        normalizedPlan = {
            ...normalizedPlan,
            arrivalTerminalId,
            departureTerminalId,
            departureTime,
            isTemporaryRoute,
            pattern: determineVariant(operatedDates, parsingWindowSize),
            fare: mergeFares(plans.map((plan) => plan.fare)),
            stops: mergeStop(plans.map((plan) => plan.stops)),
            extra: mergeExtra(plans.map((plan) => plan.extra)),
            routeId: plans[0].routeId,
        }

        const uniqueRouteIds = new Set(plans.map((plan) => plan.routeId))

        if (uniqueRouteIds.size > 1) {
            throw new Error(
                `Merged plans have different route IDs: ${[
                    ...uniqueRouteIds,
                ].join(', ')}`,
            )
        }

        normalizedPlans.set(planKey, normalizedPlanScheme.parse(normalizedPlan))
    }

    return [...normalizedPlans.values()]
}

function mergeFares(fares: PlannedOperation['fare'][]): {
    [key in keyof PlannedOperation['fare']]: number[]
} {
    const fareKeys = Object.keys(fares[0])

    const mergedFare: ReturnType<typeof mergeFares> = {} as any

    for (const _fareKey of fareKeys) {
        const fareKey = _fareKey as keyof PlannedOperation['fare']

        const fareValues = fares.map((fare) => fare[fareKey])
        mergedFare[fareKey] = mergeValues(fareValues)
    }

    return mergedFare
}

function mergeStop(stopss: (string[] | null)[]): {
    name: string
}[][] {
    const flattenedStops = stopss
        .filter((stops): stops is string[] => !!stops)
        .map((stops) => stops.join('/>'))
    const mergedStops = mergeValues(flattenedStops)
        .filter((stopsString) => stopsString.length > 0)
        .map((stops) => stops.split('/>'))
        .map((stops) => stops.map((stop) => ({ name: stop })))

    return mergedStops
}

function mergeValues<T>(values: T[]): T[] {
    const uniqueValues = [...new Set(values)].toSorted((a, b) =>
        a < b ? -1 : a > b ? 1 : 0,
    )
    return uniqueValues
}

function mergeExtra(
    extras: PlannedOperation['extra'][],
): NormalizedPlan['extra'] {
    const mergedExtra = {} as NormalizedPlan['extra']
    const mergingKeys = ['seatsAmount', 'busClass'] as const

    for (const mergingKey of mergingKeys) {
        const values = extras.map((extra) => extra[mergingKey])
        //@ts-ignore
        mergedExtra[mergingKey] = mergeValues(values)
    }

    return mergedExtra
}
