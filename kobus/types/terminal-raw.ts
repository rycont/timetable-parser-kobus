import { z } from 'zod'

import { stringToNumber, ynEnum } from '../../common/scheme.ts'

export const rawDirectRoutesScheme = z.object({
    homeTickYn: ynEnum,
    prmmDcYn: ynEnum,
    takeTime: stringToNumber,
    deprArea: stringToNumber,
    deprNm: z.string(),
    deprCd: stringToNumber,
    arvlArea: stringToNumber,
    arvlNm: z.string(),
    arvlCd: stringToNumber,
})

export const rawTransferRoutesScheme = z.object({
    arvlArea: stringToNumber,
    tfrCd: stringToNumber,
    arvlNm: z.string(),
    arvlNmAll: z.string(),
    deprNm: z.string(),
    tfrArea: stringToNumber,
    arvlCd: stringToNumber,
    deprCd: stringToNumber,
    tfrNm: z.string(),
    deprArea: stringToNumber,
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
