import {
    PlannedOperation,
    NormalizedPlan,
    normalizedPlanScheme,
} from '../types/plan-raw.ts'
import { determineVariant } from './determine-variant.ts'

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

function mergeValues<T>(values: T[]): T[] {
    const uniqueValues = [...new Set(values)].toSorted()
    return uniqueValues
}

function flattenDepartureTime(plan: PlannedOperation) {
    return `${plan.departureTime.hour}-${plan.departureTime.minute}`
}
