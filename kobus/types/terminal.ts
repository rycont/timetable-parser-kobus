import { z } from 'zod'
import { numericString } from '../../common/scheme.ts'
import { routeScheme } from "../../common/scheme/operation.ts";

export const transferRouteScheme = routeScheme.extend({
    transferTerminalId: numericString,
})

export type Route = z.infer<typeof routeScheme>
export type TransferRoute = z.infer<typeof transferRouteScheme>
