import { z } from 'zod'

// {
//     BUS_ORDER_CREATE_DAYS: 31,
//     TERMINAL_TYPE: "1",
//     ROUND_TICKET_CD: "2",
//     TERMINAL_AREA: "경북",
//     TERMINAL_NM: "김천",
//     TERMINAL_ENG_NM: "GIMCHEON",
//     TERMINAL_ID: "5016",
//     V_AREA: "47",
//     TERMINAL_ALPHABET: "G",
//     TERMINAL_MOEUM: "ㄱ",
//     MAIN_TERMINAL_CD: "0"
//   },

const rawTerminalScheme = z
    .object({
        TERMINAL_NM: z.string(),
        TERMINAL_ID: z.string(),
        V_AREA: z.string().optional(),
    })
    .transform((terminal) => ({
        name: terminal.TERMINAL_NM,
        id: terminal.TERMINAL_ID,
        area: terminal.V_AREA,
    }))

export const rawAllTerminalsScheme = z
    .object({
        terminalList: z.array(rawTerminalScheme),
    })
    .transform((data) => data.terminalList)

export const rawEndTerminalScheme = z
    .object({
        terminalEndList: z.array(rawTerminalScheme),
    })
    .transform((data) => data.terminalEndList)
