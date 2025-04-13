import { z } from 'zod'
import { numericString } from '../../common/scheme.ts'

export const terminalScheme = z.object({
    id: numericString,
    name: z.string(),
    area: numericString,
})

export const routeScheme = z.object({
    departureTerminalId: numericString,
    arrivalTerminalId: numericString,
    durationInMinutes: z.number(),
})

export const transferRouteScheme = routeScheme.extend({
    transferTerminalId: numericString,
})

export type Terminal = z.infer<typeof terminalScheme>
export type Route = z.infer<typeof routeScheme>
export type TransferRoute = z.infer<typeof transferRouteScheme>
