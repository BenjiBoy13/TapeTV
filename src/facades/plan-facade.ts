import { connectionPool as cp } from "../database-pool";
import RequestError from "../error/RequestError";
import { HttpStatusCodeEnum, HttpStatusDescriptionEnum } from "../utils/enums/http-numerators";
import IPlan from "../models/IPlan";
import {propertiesToColumns} from "../utils/knex-utils";
import { TTVAPIErrors } from "../utils/enums/business-numerators";

export async function selectFromPlanByPlanId(planId: number, properties: string[]): Promise<IPlan> {
    let planRS = await cp
        .from('tbl_plan')
        .select(propertiesToColumns(properties))
        .where('plan_id', planId);

    if (planRS.at(0) !== undefined)
        return Promise.resolve(planRS.at(0) as unknown as IPlan);

    return Promise.reject(new RequestError(
        TTVAPIErrors.DATABASE_GENERAL_EMPTY_RS,
        HttpStatusCodeEnum.INTERNAL_SERVER_ERROR,
        HttpStatusDescriptionEnum.INTERNAL_SERVER_ERROR
    ));
}