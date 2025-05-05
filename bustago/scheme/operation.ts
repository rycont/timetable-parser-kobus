import { z } from 'zod'

export const rawOperationScheme = z
    .object({
        ticketSingleList: z.array(
            z.object({
                TRANSP_BIZR_ABBR_NM: z.string(),
                BUS_TYPE_NM: z.string(),
                DEP_TIME: z.string(),
                DEP_DATE: z.string(),
                FARE1: z.number(),
                FARE0: z.number(),
                FARE3: z.number(),
                FARE2: z.number(),
                TOT_SEAT_CNT: z.string(),
                sterCode: z.string(),
                eterCode: z.string(),
                DATE_ARRAY: z.string(),
                BUS_ROUTE_ID: z.string(),
                BUS_ORDER_CREATE_DAYS: z.number(),
            }),
        ),
    })
    .transform((data) => data.ticketSingleList)

export type RawOperation = z.infer<typeof rawOperationScheme>[number]
