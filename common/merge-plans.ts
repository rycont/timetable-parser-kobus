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
        flattenDepartureTime(plan),
    )
    const normalizedPlans = new Map<string, NormalizedPlan>()

    const mergingKeys = [
        'operator',
        'busClass',
        'seatsAmount',
        'durationInMinutes',
        'stops',
    ] as const

    for (const planKey in plansByPlanKey) {
        let normalizedPlan: Partial<NormalizedPlan> = {}

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

function flattenDepartureTime(plan: PlannedOperation) {
    return `${plan.departureTime.hour}-${plan.departureTime.minute}`
}
