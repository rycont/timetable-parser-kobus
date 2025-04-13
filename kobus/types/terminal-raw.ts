import { z } from 'zod'

import { numericString, stringToNumber, ynEnum } from '../../common/scheme.ts'

export const rawDirectRoutesScheme = z.object({
    homeTickYn: ynEnum,
    prmmDcYn: ynEnum,
    takeTime: stringToNumber,
    deprArea: numericString,
    deprNm: z.string(),
    deprCd: numericString,
    arvlArea: numericString,
    arvlNm: z.string(),
    arvlCd: numericString,
})

export const rawTransferRoutesScheme = z.object({
    arvlArea: numericString,
    tfrCd: numericString,
    arvlNm: z.string(),
    arvlNmAll: z.string(),
    deprNm: z.string(),
    tfrArea: numericString,
    arvlCd: numericString,
    tfrNm: z.string(),
    deprArea: numericString,
    deprCd: numericString,
})

export const rawRouteResponseScheme = z.object({
    tfrLen: z.number(),
    tfrInfList: z.array(rawTransferRoutesScheme),
    len: z.number(),
    codeYn: ynEnum,
    rotInfList: z.array(rawDirectRoutesScheme),
})

export type RawRouteResponse = z.infer<typeof rawRouteResponseScheme>
export type RawDirectRoutes = z.infer<typeof rawDirectRoutesScheme>
export type RawTransferRoutes = z.infer<typeof rawTransferRoutesScheme>
