import { cachedCrawl } from '../../common/cached-crawl.ts'
import { Terminal } from '../types/terminal.ts'

export async function fetchKobusPlans(
    departureTerminal: Terminal,
    arrivalTerminal: Terminal,
): Promise<string[]> {
    const date = new Date()
    date.setDate(date.getDate() + 1)

    const fileName = `kobus-route-plans-${departureTerminal.id}-${arrivalTerminal.id}.json`

    const rawResult = await cachedCrawl({
        entryPoint: 'https://www.kobus.co.kr/oprninf/alcninqr/oprnAlcnPage.do',
        fileName,
        targetUri: 'https://www.kobus.co.kr/oprninf/alcninqr/readAlcnSrch.ajax',
        action: async (page) => {
            page.on('dialog', async (dialog) => {
                await new Promise((resolve) =>
                    setTimeout(resolve, 600 + Math.random() * 100),
                )
                await dialog.dismiss()
                console.log('Dialog dismissed')
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
                const yyyymmdd = date
                    .toISOString()
                    .slice(0, 10)
                    .replaceAll('-', '')
                console.log(`${i + 1} / 14: ${yyyymmdd}`)
                await page.evaluate(
                    `
document.querySelector('#alcnSrchBtn .btn_confirm').classList.remove('ready')
document.querySelector('#deprDtm').value = '${yyyymmdd}'
document.querySelector("#alcnSrchBtn").children[0].click()`,
                )

                // Wait for the results to load
                const delay = 1000 + Math.floor(Math.random() * 1000)
                await new Promise((resolve) => setTimeout(resolve, delay))
                date.setDate(date.getDate() + 1)
            }
        },
    })

    return rawResult
}
