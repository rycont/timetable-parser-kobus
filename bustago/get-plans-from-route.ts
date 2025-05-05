import { determineVariant } from '../common/determine-variant.ts'
import { mergePlans } from '../common/merge-plans.ts'
import saveData from '../common/save-data.ts'
import {
    OperatingPattern,
    plannedOperationScheme,
} from '../common/scheme/operation.ts'
import getPlansFromRouteInSpecificDate from './get-plans-from-route-specific-date.ts'
import { RawOperation } from './scheme/operation.ts'

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

    for (let i = 0; i < 7; i++) {
        date.setDate(date.getDate() + 1)

        const plans = await getPlansFromRouteInSpecificDate(
            departureTerminalId,
            arrivalTerminalId,
            date,
        )

        for (const plan of plans) {
            const planKey = plan.DEP_TIME

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

    await saveData(
        'bustago',
        `timetable/${departureTerminalId}-${arrivalTerminalId}`,
        JSON.stringify(mergedPlans, null, 2),
    )

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
        busClass: data.BUS_TYPE_NM,
        seatsAmount: parseInt(data.TOT_SEAT_CNT),
        isTemporaryRoute: false,
        departureTerminalId: data.sterCode,
        arrivalTerminalId: data.eterCode,
        durationInMinutes: -1,
    })
}

function determineVariantBustago(plans: RawOperation[]): OperatingPattern {
    const today = new Date()

    const operatingDates = [
        ...new Set(
            plans
                .flatMap((plan) => plan.DATE_ARRAY.split(','))
                .map((date) => date.split(' ')[0]),
        ),
    ]
        .map((date) => new Date(date))
        .filter((date) => today < date)

    const parsingWindow = plans[0].BUS_ORDER_CREATE_DAYS

    if (operatingDates.length === parsingWindow) {
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

    if (uniqueIntervals.length === 1) {
        console.log('Another type of interval has appeared!', uniqueIntervals)
        throw new Error('Another type of interval has appeared!')
    }

    if (parsingWindow === 14) {
        return determineVariant(
            operatingDates.map((date) => date.toISOString().slice(0, 10)),
            parsingWindow,
        )
    }

    return {
        type: 'unknown',
    }
}
