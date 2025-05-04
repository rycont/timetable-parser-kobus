import { z } from 'zod'
import { numericString } from '../../common/scheme.ts'

export const routeScheme = z.object({
    departureTerminalId: numericString,
    arrivalTerminalId: numericString,
    durationInMinutes: z.number(),
})

export const transferRouteScheme = routeScheme.extend({
    transferTerminalId: numericString,
})

export type Route = z.infer<typeof routeScheme>
export type TransferRoute = z.infer<typeof transferRouteScheme>
