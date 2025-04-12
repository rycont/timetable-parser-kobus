import { z } from 'zod'

export const terminalScheme = z.object({
    id: z.number(),
    name: z.string(),
    area: z.number(),
})

export const routeScheme = z.object({
    departureTerminalId: z.number(),
    arrivalTerminalId: z.number(),
    durationInMinutes: z.number(),
})

export const transferRouteScheme = routeScheme.extend({
    transferTerminalId: z.number(),
})

export type Terminal = z.infer<typeof terminalScheme>
export type Route = z.infer<typeof routeScheme>
export type TransferRoute = z.infer<typeof transferRouteScheme>
