import { cachedFetch } from '../../common/cached-fetch.ts'
import { formatLocalDate } from '../../common/format-local-date.ts'
import { Terminal } from '../../common/scheme/terminal.ts'

const URI = 'https://intercitybus.tmoney.co.kr/runinf/readRunInfList.do'

export async function getSpecificDayPlan(
    departureTerminal: Terminal,
    arrivalTerminal: Terminal,
    date: Date,
) {
    const formData = new FormData()

    // depr_Trml_Cd: 2401401
    // arvl_Trml_Cd: 1242001
    // depr_Trml_Nm: 동송
    // arvl_Trml_Nm: 가평
    // depr_Dt: 20250505
    // deprTime: 00:00
    // bef_Aft_Dvs: D
    // req_Rec_Num: 10
    // depr_Time: 00:00

    formData.append('depr_Trml_Cd', departureTerminal.id)
    formData.append('arvl_Trml_Cd', arrivalTerminal.id)
    formData.append('depr_Trml_Nm', departureTerminal.name)
    formData.append('arvl_Trml_Nm', arrivalTerminal.name)
    formData.append('depr_Dt', formatLocalDate(date))
    formData.append('deprTime', '00:00')
    formData.append('bef_Aft_Dvs', 'D')
    formData.append('req_Rec_Num', '10')
    formData.append('depr_Time', '00:00')
}
