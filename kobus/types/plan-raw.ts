import { z } from 'zod'
import {
    numericString,
    stringToNumber,
    timeScheme,
    ynEnum,
    yyyymmddScheme,
} from '../../common/scheme.ts'
import { PlannedOperation, plannedOperationScheme } from '../../common/scheme/operation.ts'

export const rawPlanScheme = z.object({
    RMN_SATS_NUM: stringToNumber,
    ADLT_FEE: stringToNumber,
    ALCN_ARVL_TRML_NO: numericString,
    ALCN_CHC: z.string(),
    ARVL_TRML_NO: numericString,
    CACM_CSS: z.string(),
    CHLD_FEE: stringToNumber,
    TEMP_ROT_YN: z.string().nullable(),
    BUS_CLS_NM: z.string(),
    ALCN_DEPR_TRML_NO: numericString,
    ALCN_CHC_DIV: z.string(),
    TOT_SATS_NUM: stringToNumber,
    ALCN_DEPR_TIME: numericString,
    ALCN_CHC_CSS: z.string(),
    TEEN_FEE: stringToNumber,
    DEPR_TIME: numericString,
    TIME_CHC: z.unknown(),
    DRTM_MOD_PSB_YN: z.string().nullable(),
    BUS_CLS_CD: stringToNumber,
    CTY_PRMM_DC_YN: z.string().nullable(),
    UVSD_FEE: stringToNumber,
    DEPR_TIME_DVS: z.string(),
    ALCN_TIME0: z.string(),
    DEPR_DT: numericString.length(8).transform((d) => {
        const year = d.slice(0, 4)
        const month = d.slice(4, 6)
        const day = d.slice(6, 8)
        return `${year}-${month}-${day}`
    }),
    BUS_CLS_CD_CSS: z.string(),
    CACM_CD: numericString,
    CACM_MN: z.string(),
    DEPR_TRML_NO: numericString,
})

export const rawPlanListResponseScheme = z
    .object({
        allCnt: z.number(),
        alcnCmnMap: z.object({
            TRTR_TRML_INCL_YN: ynEnum,
            TAKE_DRTM: stringToNumber,
            BUS_OPRN_DIST: stringToNumber,
            takeDrtm: z.string(),
            MSG_CD: z.string(),
            MSG_DTL_CTT: z.string(),
        }),
        timeChcList: z.unknown(),
        rotVldChc: ynEnum,
        scsYn: ynEnum,
        alcnAllList: z.array(rawPlanScheme),
    })
    .transform((data) =>
        data.alcnAllList.map((item) =>
            plannedOperationScheme.parse({
                departureTime: {
                    hour: parseInt(item.DEPR_TIME.slice(0, 2), 10),
                    minute: parseInt(item.DEPR_TIME.slice(2, 4), 10),
                },
                durationInMinutes: data.alcnCmnMap.TAKE_DRTM,
                isTemporaryRoute: item.TEMP_ROT_YN === 'Y',
                operator: item.CACM_MN,
                arrivalTerminalId: item.ARVL_TRML_NO,
                departureTerminalId: item.DEPR_TRML_NO,
                busClass: item.BUS_CLS_NM,
                seatsAmount: item.TOT_SATS_NUM,
                date: item.DEPR_DT,
                fare: {
                    어른: item.ADLT_FEE,
                    초등생: item.CHLD_FEE,
                    중고생: item.TEEN_FEE,
                },
            } satisfies PlannedOperation),
        ),
    )

export type RawPlanResponse = z.infer<typeof rawPlanListResponseScheme>
export type RawPlan = z.infer<typeof rawPlanScheme>
