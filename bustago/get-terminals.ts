import { cachedFetch } from '../common/cached-fetch.ts'
import saveData from '../common/save-data.ts'
import { Terminal } from '../common/scheme/terminal.ts'
import { rawAllTerminalsScheme } from './scheme/terminal.ts'

const URI =
    'https://www.bustago.or.kr/newweb/kr/common/terminalListAjax.do?area=&searchTerminalNm='

export async function getTerminals() {
    const rawTerminals = await cachedFetch('bustago-terminals.json', URI, {
        method: 'POST',
    })

    const terminals = rawAllTerminalsScheme.parse(JSON.parse(rawTerminals))
    await saveData('bustago', 'terminals', JSON.stringify(terminals))

    const terminalsMap = new Map<string, Terminal>(
        terminals.map((terminal) => [terminal.id, terminal]),
    )

    return terminalsMap
}
