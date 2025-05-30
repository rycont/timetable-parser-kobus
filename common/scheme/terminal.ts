import { z } from 'zod'
import { numericString } from '../scheme.ts'

export const terminalScheme = z.object({
    id: numericString,
    name: z.string(),
    area: numericString.optional(),
})

export type Terminal = z.infer<typeof terminalScheme>
