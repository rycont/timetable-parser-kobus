import { z } from 'zod'

import cachedCrawl from '../common/cached-fetch.ts'
import { Plan, rawPlanListResponseScheme } from './types/plan-raw.ts'
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

    const planKeysByDate = new Map(
        timetableByDate.map((timetable) => [
            timetable[0].date,
            timetable.map(createPlanKey),
        ]),
    )

    const isVariationExists = hasVariation([...planKeysByDate.values()])

    if (isVariationExists) {
        console.log(getVariants(planKeysByDate))
    } else {
        console.log('No variation')
    }
}

function createPlanKey(plan: Plan) {
    return `${plan.departureTime.hour}-${plan.departureTime.minute}`
}

function hasVariation(planKeysByDate: string[][]) {
    const flattenedFirstPlanKeys = planKeysByDate[0].join('/')

    return !planKeysByDate.slice(1).every((planKeys) => {
        const flattenedPlanKeys = planKeys.join('/')
        return flattenedFirstPlanKeys === flattenedPlanKeys
    })
}

function getVariants(planKeysByDateMap: Map<string, string[]>) {
    const allPlanKeys = [...planKeysByDateMap.values()].flat()
    const uniquePlanKeys = [...new Set(allPlanKeys)]

    return uniquePlanKeys.map((key) => [
        key,
        determineVariant(key, planKeysByDateMap),
    ])
}

function determineVariant(
    planKey: string,
    planKeysByDateMap: Map<string, string[]>,
) {
    const operatedDates = [...planKeysByDateMap.keys()]
        .filter((date) => planKeysByDateMap.get(date)?.includes(planKey))
        .map((yyyymmdd) => {
            const temporalDate = Temporal.PlainDate.from(yyyymmdd)
            return temporalDate
        })

    const isAllDayOperation = operatedDates.length === planKeysByDateMap.size

    if (isAllDayOperation) {
        return [
            {
                type: 'all-day',
            },
        ]
    }

    const operatingDatesInYear = operatedDates.map((date) => date.dayOfYear)

    const dateIntervals = operatingDatesInYear
        .map((dayOfYear, index) => dayOfYear - operatingDatesInYear[index - 1])
        .slice(1)

    const isEvenOddOperation = dateIntervals.every((interval) => interval === 2)

    if (isEvenOddOperation) {
        return [
            {
                type: 'even-odd',
            },
        ]
    }

    const operatingDaysInWeek = operatedDates.map((date) => date.dayOfWeek)

    const operatingCountsByDayMap = new Map<number, number>()

    for (const day of operatingDaysInWeek) {
        const count = operatingCountsByDayMap.get(day) ?? 0
        operatingCountsByDayMap.set(day, count + 1)
    }

    console.log(operatingCountsByDayMap)

    throw 'Fucked'
}
