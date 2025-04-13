import cachedCrawl from '../common/cached-fetch.ts'
import {
    NormalizedPlan,
    normalizedPlanScheme,
    OperatingPattern,
    PlannedOperation,
    rawPlanListResponseScheme,
} from './types/plan-raw.ts'
import { Terminal } from './types/terminal.ts'

export async function getRoutePlans(
    departureTerminal: Terminal,
    arrivalTerminal: Terminal,
) {
    let date = Temporal.Now.plainDateISO().add({ days: 1 })

    const fileName = `kobus-route-plans-${departureTerminal.id}-${
        arrivalTerminal.id
    }-${date.toString().replace(/-/g, '')}.json`

    const rawResult = await cachedCrawl({
        entryPoint: 'https://www.kobus.co.kr/oprninf/alcninqr/oprnAlcnPage.do',
        fileName,
        targetUri: 'https://www.kobus.co.kr/oprninf/alcninqr/readAlcnSrch.ajax',
        action: async (page) => {
            await page.screenshot({
                path: 'screenshot.png',
            })
            // Set departure and arrival terminals
            await page.evaluate(
                `
document.querySelector('#deprCd').value = '${departureTerminal.id}'
document.querySelector('#deprNm').value = '${departureTerminal.name}'

document.querySelector('#arvlCd').value = '${arrivalTerminal.id}'
document.querySelector('#arvlNm').value = '${arrivalTerminal.name}'

document.querySelector('#crchDeprArvlYn').value = 'N'
document.querySelector('#busClsCd').value = '0'
document.querySelector('#prmmDcYn').value = 'N'
`,
            )

            for (let i = 0; i < 14; i++) {
                const yyyymmdd = date.toString().replace(/-/g, '')
                console.log(yyyymmdd)
                await page.evaluate(
                    `
document.querySelector('#alcnSrchBtn .btn_confirm').classList.remove('ready')
document.querySelector('#deprDtm').value = '${yyyymmdd}'
document.querySelector("#alcnSrchBtn").children[0].click()`,
                )

                // Wait for the results to load
                const delay = 2000 + Math.floor(Math.random() * 3000)
                await new Promise((resolve) => setTimeout(resolve, delay))
                date = date.add({ days: 1 })
            }
        },
    })

    const timetableByDate = rawResult.map((item) =>
        rawPlanListResponseScheme.parse(JSON.parse(item)),
    )

    const mergedPlans = normalizedPlanScheme
        .array()
        .parse(mergePlans(timetableByDate.flat()))

    return mergedPlans
}

function createPlanKey(plan: PlannedOperation) {
    return `${plan.departureTime.hour}-${plan.departureTime.minute}`
}

function determineVariant(
    operatedDatesString: string[],
    parsingWindowSize: number,
): OperatingPattern {
    const operatedDates = operatedDatesString.map((yyyymmdd) => {
        const temporalDate = Temporal.PlainDate.from(yyyymmdd)
        return temporalDate
    })

    const isAllDayOperation = operatedDates.length === parsingWindowSize

    if (isAllDayOperation) {
        return {
            type: 'everyday',
        }
    }

    const operatingDatesInYear = operatedDates.map((date) => date.dayOfYear)

    const dateIntervals = operatingDatesInYear
        .map((dayOfYear, index) => dayOfYear - operatingDatesInYear[index - 1])
        .slice(1)

    const isEvenOddOperation = dateIntervals.every((interval) => interval === 2)

    if (isEvenOddOperation) {
        return {
            type: 'even-odd',
        }
    }

    const operatingDaysInWeek = operatedDates.map((date) => date.dayOfWeek)

    const operatingCountsByDayMap = new Map<number, number>()

    for (const day of operatingDaysInWeek) {
        const count = operatingCountsByDayMap.get(day) ?? 0
        operatingCountsByDayMap.set(day, count + 1)
    }

    const isSpecificDayOperation = [...operatingCountsByDayMap.values()].every(
        (count) => count === 2,
    )

    if (isSpecificDayOperation) {
        return {
            type: 'specific-day',
            days: [...operatingCountsByDayMap.keys()],
        }
    }

    const daysByOperatingTypes = {
        ...Object.groupBy(
            [...operatingCountsByDayMap.keys()],
            (day) => operatingCountsByDayMap.get(day)!,
        ),
    }

    const fixedDays = daysByOperatingTypes['2']!
    const irregularDays = daysByOperatingTypes['1']!

    return {
        type: 'irregular',
        fixedDays,
        irregularDays,
    }
}

function mergePlans(plans: PlannedOperation[]) {
    const plansByPlanKey = Object.groupBy(plans, (plan) => createPlanKey(plan))
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

        const operatedDates = plans.map((plan) => plan.date)

        normalizedPlan = {
            ...normalizedPlan,
            arrivalTerminalId,
            departureTerminalId,
            departureTime,
            isTemporaryRoute,
            pattern: determineVariant(operatedDates, 14),
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
    const uniqueValues = [...new Set(values)]
    return uniqueValues
}
