import { z } from 'zod'

export const numericString = z
    .string()
    .regex(/^\d+(\.\d+)?$/, '숫자 문자열이 필요합니다')

export const stringToNumber = numericString.transform((d) => parseFloat(d))

export const ynEnum = z.enum(['Y', 'N'])

// export interface Time {
//     hour: number
//     minute: number
// }

export const timeScheme = z.object({
    hour: z.number().int().min(0).max(23),
    minute: z.number().int().min(0).max(59),
})

export const yyyymmddScheme = z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD 형식이어야 합니다')

export type Time = z.infer<typeof timeScheme>
