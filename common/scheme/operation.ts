import { z } from 'zod'
import { timeScheme, yyyymmddScheme } from '../scheme.ts'

export const routeScheme = z.object({
    departureTerminalId: z.string(),
    arrivalTerminalId: z.string(),
    durationInMinutes: z.number(),
})

export const plannedOperationScheme = routeScheme.extend({
    operator: z.string(),
    departureTime: timeScheme,
    isTemporaryRoute: z.boolean(),
    date: yyyymmddScheme,
    fare: z.object({
        어른: z.number(),
        초등생: z.number(),
        중고생: z.number(),
    }),
    // 경유지
    stops: z.string().array().nullable(),
    type: z.literal('bus'),
    extra: z.object({
        seatsAmount: z.number(),
        busClass: z.string(),
    }),
    routeId: z.string(),
})

// NormalizedPlan은 특정 일자가 아닌, 일반적인 운행 패턴을 담고 있는 스키마입니다.
// 그렇기에 date 필드는 포함되어 있지 않습니다.

export const operatingPatternScheme = z.union([
    z.object({
        type: z.literal('everyday'),
    }),
    z.object({
        type: z.literal('even-odd'),
    }),
    z.object({
        type: z.literal('specific-day'),
        days: z.array(z.number().max(7).min(1)),
    }),
    z
        .object({
            type: z.literal('irregular'),
            fixedDays: z.array(z.number().max(7).min(1)),
            irregularDays: z.array(z.number().max(7).min(1)),
        })
        .refine(
            (data) =>
                data.fixedDays?.length !== 0 ||
                data.irregularDays?.length !== 0,
            {
                message: 'fixedDays or irregularDays must be provided',
            },
        ),
    z.object({
        type: z.literal('unknown'),
    }),
])

export type OperatingPattern = z.infer<typeof operatingPatternScheme>

export const normalizedPlanScheme = plannedOperationScheme
    .omit({
        date: true,
    })
    .extend({
        pattern: operatingPatternScheme,
        operator: z.string().array(),
        fare: z.object({
            어른: z.number().array(),
            초등생: z.number().array(),
            중고생: z.number().array(),
        }),
        durationInMinutes: z.number().array(),
        stops: z
            .object({
                name: z.string(),
                time: timeScheme.optional(),
            })
            .array()
            .array()
            .nullable(),
        extra: z.object({
            seatsAmount: z.number().array(),
            busClass: z.string().array(),
        }),
    })

export type NormalizedPlan = z.infer<typeof normalizedPlanScheme>

export type PlannedOperation = z.infer<typeof plannedOperationScheme>
