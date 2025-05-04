import { Terminal } from '../../common/scheme/terminal.ts'
import getServerDate from './get-server-date.ts'

export async function getPlansFromRoute(
    departureTerminal: Terminal,
    arrivalTerminal: Terminal,
) {
    const serverDate = await getServerDate()
    console.log('Server Date:', serverDate)
}
