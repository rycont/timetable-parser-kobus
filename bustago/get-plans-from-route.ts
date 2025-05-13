import { tqdm } from '@thesephist/tsqdm'
import { mergePlans } from '../common/merge-plans.ts'
import saveData from '../common/save-data.ts'
import {
    OperatingPattern,
    plannedOperationScheme,
} from '../common/scheme/operation.ts'
import getPlansFromRouteInSpecificDate from './get-plans-from-route-specific-date.ts'
import { RawOperation } from './scheme/operation.ts'

const PARSING_WINDOW_SIZE = 14

export async function getPlansFromRoute(
    departureTerminalId: string,
    arrivalTerminalId: string,
) {
    const today = new Date()

    const date = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
    )

    const plansByPlanKey: Map<string, RawOperation[]> = new Map()

    const iterations = Array(PARSING_WINDOW_SIZE).fill(0)

    let isFresh = false

    for await (const _ of tqdm(iterations)) {
        date.setDate(date.getDate() + 1)

        const plans = await getPlansFromRouteInSpecificDate(
            departureTerminalId,
            arrivalTerminalId,
            date,
        )

        if (plans.fresh) {
            isFresh = true
        }

        for (const plan of plans.data) {
            const planKey = plan.DEP_TIME + '@' + plan.BUS_ROUTE_ID

            if (plansByPlanKey.has(planKey)) {
                plansByPlanKey.get(planKey)!.push(plan)
            } else {
                plansByPlanKey.set(planKey, [plan])
            }
        }
    }

    const mergedPlans = [...plansByPlanKey.values()].map((plans) =>
        mergeBustagoPlans(plans),
    )

    if (isFresh) {
        await saveData(
            'bustago',
            `timetable/${departureTerminalId}-${arrivalTerminalId}`,
            JSON.stringify(mergedPlans, null, 2),
        )
    }

    return mergedPlans
}

function mergeBustagoPlans(plans: RawOperation[]) {
    const plannedOperations = plans.map(rawOperationToPlannedOperation)

    const mergedPlans = mergePlans(plannedOperations, 7)

    if (mergedPlans.length !== 1) {
        throw 'Unexpected number of merged plans: ' + mergedPlans.length
    }

    const variants = determineVariantBustago(plans)
    mergedPlans[0].pattern = variants

    return mergedPlans[0]
}

function rawOperationToPlannedOperation(data: RawOperation) {
    return plannedOperationScheme.parse({
        ...data,
        fare: {
            어른: data.FARE0,
            중고생: data.FARE2,
            초등생: data.FARE3,
        },
        date:
            data.DEP_DATE.slice(0, 4) +
            '-' +
            data.DEP_DATE.slice(4, 6) +
            '-' +
            data.DEP_DATE.slice(6, 8),
        departureTime: {
            hour: parseInt(data.DEP_TIME.slice(0, 2)),
            minute: parseInt(data.DEP_TIME.slice(2, 4)),
        },
        busType: data.BUS_TYPE_NM,
        operator: data.TRANSP_BIZR_ABBR_NM,
        isTemporaryRoute: false,
        departureTerminalId: data.sterCode,
        arrivalTerminalId: data.eterCode,
        durationInMinutes: data.DIST_TIME,
        stops: data.ROUTE_DATA.split('→'),
        extra: {
            busClass: data.BUS_TYPE_NM,
            seatsAmount: parseInt(data.TOT_SEAT_CNT),
        },
        type: 'bus',
        routeId: data.BUS_ROUTE_ID,
    })
}

function determineVariantBustago(plans: RawOperation[]): OperatingPattern {
    const operatingDates = [
        ...new Set(
            plans.map(
                (plan) =>
                    `${plan.DEP_DATE.slice(0, 4)}-${plan.DEP_DATE.slice(
                        4,
                        6,
                    )}-${plan.DEP_DATE.slice(6, 8)}`,
            ),
        ),
    ].map((date) => new Date(date))

    const uploadedAmount = plans[0].BUS_ORDER_CREATE_DAYS

    if (operatingDates.length === PARSING_WINDOW_SIZE) {
        return {
            type: 'everyday',
        }
    }

    const intervals = operatingDates
        .map((date, index) => {
            if (index === 0) {
                return 0
            }

            const prevDate = operatingDates[index - 1]
            return (date.getTime() - prevDate.getTime()) / 1000 / 60 / 60 / 24
        })
        .slice(1)

    const uniqueIntervals = [...new Set(intervals)]

    if (uniqueIntervals.length === 1 && uniqueIntervals[0] === 2) {
        return {
            type: 'even-odd',
        }
    }

    if (uniqueIntervals[0] === 1 && operatingDates.length >= 6) {
        return {
            type: 'everyday',
        }
    }

    if (uploadedAmount < 8) {
        return {
            type: 'unknown',
        }
    }

    // if (uniqueIntervals.length === 1 && operatingDates.length > 2) {
    //     console.log('Another type of interval has appeared!', uniqueIntervals)
    //     console.log(operatingDates, uploadedAmount)
    //     console.log(plans[0])
    //     throw new Error('Another type of interval has appeared!')
    // }

    const operationPerDays = Object.entries(
        Object.groupBy(operatingDates, (date) => date.getDay() || 7),
    )

    const onceDays = operationPerDays
        .filter(([_, dates]) => dates!.length === 1)
        .map(([day, _]) => +day)

    const twiceDays = operationPerDays
        .filter(([_, dates]) => dates!.length === 2)
        .map(([day, _]) => +day)

    // const onceDays =
    //     operationPerDays['1']?.map((date) => date.getDate() || 7).toSorted() ||
    //     []
    // const twiceDays =
    //     operationPerDays['2']?.map((date) => date.getDate() || 7).toSorted() ||
    //     []

    if (twiceDays.length > 0 && onceDays.length > 0) {
        return {
            type: 'irregular',
            fixedDays: twiceDays,
            irregularDays: onceDays,
        }
    }

    if (twiceDays.length > 0 && onceDays.length === 0) {
        return {
            type: 'specific-day',
            days: twiceDays,
        }
    }

    if (twiceDays.length === 0 && onceDays.length > 0) {
        return {
            type: 'specific-day',
            days: onceDays,
        }
    }

    console.log(operatingDates)
    console.log(operationPerDays)
    throw ''

    // if (onceDays.length === 0) {
    //     console.log(operatingDates)
    //     console.log(operationPerDays)
    //     throw ''
    // }

    // return {
    //     type: 'specific-day',
    //     days: onceDays,
    // }
}
