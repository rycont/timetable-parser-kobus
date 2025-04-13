import { OperatingPattern } from '../types/plan-raw.ts'

export function determineVariant(
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

    const fixedDays = daysByOperatingTypes['2'] || []
    const irregularDays = daysByOperatingTypes['1'] || []

    return {
        type: 'irregular',
        fixedDays,
        irregularDays,
    }
}
