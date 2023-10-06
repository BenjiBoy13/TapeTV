import { connectionPool as cp } from "../database-pool";
import IUserModel from "../models/IUserModel";
import {
    TTVAPIErrors,
    TTVOnboardingStatus,
    TTVPlansEnum,
    TTVPlansStorageEnum
} from "../utils/enums/business-numerators";
import RequestError from "../error/RequestError";
import { HttpStatusCodeEnum, HttpStatusDescriptionEnum } from "../utils/enums/http-numerators";
import IUserActivePlan from "../models/IUserActivePlan";
import { propertiesToColumns } from "../utils/knex-utils";
import { StripeSubscriptionIntervalEnum } from "../utils/enums/stripe-numerators";

const freePlanInsertStatement = {
    plan_id: TTVPlansEnum.FREE,
    used_storage_in_gb: 0.00,
    available_storage_in_gb: TTVPlansStorageEnum.FREE,
    renewal_method: StripeSubscriptionIntervalEnum.NEVER
}

export async function insertUserWithActivePlan(userModel: IUserModel): Promise<number> {
    let userActivePlanId: number, userId: number;

    let rawUserActivePlanId = await cp
        .insert(freePlanInsertStatement, 'user_active_plan_id')
        .into('tbl_user_active_plan');

    if (!rawUserActivePlanId || !rawUserActivePlanId.at(0) || isNaN(Number(rawUserActivePlanId.at(0))))
        return Promise.reject(new RequestError(
            TTVAPIErrors.DATABASE_GENERAL_UNEXPECTED_INTERACTION,
            HttpStatusCodeEnum.INTERNAL_SERVER_ERROR,
            HttpStatusDescriptionEnum.INTERNAL_SERVER_ERROR
        ));

    userActivePlanId = rawUserActivePlanId.at(0) as number;

    let rawUserId = await cp
        .insert({
            name: userModel.name,
            sur_name: userModel.surName,
            birthdate: new Date(userModel.birthdate),
            email: userModel.email,
            username: userModel.username,
            password: userModel.password,
            is_user_active: 1,
            is_email_confirmed: 0,
            onboarding_status: TTVOnboardingStatus.USER_CREATED,
            user_active_plan_id: userActivePlanId
        }, 'user_id')
        .into('tbl_user');

    if (!rawUserId || !rawUserId.at(0) || isNaN(Number(rawUserId.at(0))))
        return Promise.reject(new RequestError(
            TTVAPIErrors.DATABASE_GENERAL_UNEXPECTED_INTERACTION,
            HttpStatusCodeEnum.INTERNAL_SERVER_ERROR,
            HttpStatusDescriptionEnum.INTERNAL_SERVER_ERROR
        ));

    userId = rawUserId.at(0) as number;

    return Promise.resolve(userId);
}

export async function selectFromUserByUsernameOrEmail(username: string, email: string, properties: string[]): Promise<IUserModel> {
    let userRS = await cp
        .from('tbl_user')
        .select(propertiesToColumns(properties))
        .where('username', username)
        .orWhere('email', email)

    if (userRS && userRS.at(0) !== undefined)
        return Promise.resolve(userRS.at(0) as unknown as IUserModel);

    return Promise.reject(new RequestError(
        TTVAPIErrors.DATABASE_GENERAL_EMPTY_RS,
        HttpStatusCodeEnum.BAD_REQUEST,
        HttpStatusDescriptionEnum.BAD_REQUEST
    ));
}

export async function selectFromUserByUserId(userId: number, properties: string[]): Promise<IUserModel> {
    let userRS = await cp
        .from('tbl_user')
        .select(propertiesToColumns(properties))
        .where('user_id', userId);

    if (userRS.at(0) !== undefined)
        return Promise.resolve(userRS.at(0) as unknown as IUserModel);

    return Promise.reject(new RequestError(
        TTVAPIErrors.DATABASE_GENERAL_EMPTY_RS,
        HttpStatusCodeEnum.INTERNAL_SERVER_ERROR,
        HttpStatusDescriptionEnum.INTERNAL_SERVER_ERROR
    ));
}

export async function selectFromUserActivePlanByStripeCustomerId(customerId: string, properties: string[]): Promise<IUserActivePlan> {
    let userActivePlanRS = await cp
        .from('tbl_user_active_plan')
        .select(propertiesToColumns(properties))
        .where('stripe_customer_id', customerId);

    if (userActivePlanRS.at(0) !== undefined)
        return Promise.resolve(userActivePlanRS.at(0) as unknown as IUserActivePlan);

    return Promise.reject(new RequestError(
        TTVAPIErrors.DATABASE_GENERAL_EMPTY_RS,
        HttpStatusCodeEnum.INTERNAL_SERVER_ERROR,
        HttpStatusDescriptionEnum.INTERNAL_SERVER_ERROR
    ));
}

export async function selectFromUserActivePlanByUserActivePlanId(userActivePlanId: number, properties: string[]): Promise<IUserActivePlan> {
    let userActivePlanRS = await cp
        .from('tbl_user_active_plan')
        .select(propertiesToColumns(properties))
        .where('user_active_plan_id', userActivePlanId);

    if (userActivePlanRS.at(0) !== undefined)
        return Promise.resolve(userActivePlanRS.at(0) as unknown as IUserActivePlan);

    return Promise.reject(new RequestError(
       TTVAPIErrors.DATABASE_GENERAL_EMPTY_RS,
       HttpStatusCodeEnum.INTERNAL_SERVER_ERROR,
       HttpStatusDescriptionEnum.INTERNAL_SERVER_ERROR
    ));
}

export async function updateFromUserByUserId(userId: number, updateStatement: {}): Promise<boolean> {
    let updatedUserId = await cp('tbl_user')
        .where('user_id', userId)
        .update(updateStatement, 'user_id');

    if (!Boolean(updatedUserId))
        return Promise.reject(new RequestError(
            TTVAPIErrors.DATABASE_GENERAL_UNEXPECTED_INTERACTION,
            HttpStatusCodeEnum.INTERNAL_SERVER_ERROR,
            HttpStatusDescriptionEnum.INTERNAL_SERVER_ERROR
        ));

    return Promise.resolve(true);
}

export async function updateFromUserActivePlanByUserActivePlanId(userActivePlanId: number, updateStatement: {}): Promise<boolean> {
    let updatedUserActivePlanId = await cp('tbl_user_active_plan')
        .where('user_active_plan_id', userActivePlanId)
        .update(updateStatement, 'user_active_plan_id');

    if (!Boolean(updatedUserActivePlanId))
        return Promise.reject(new RequestError(
            TTVAPIErrors.DATABASE_GENERAL_UNEXPECTED_INTERACTION,
            HttpStatusCodeEnum.INTERNAL_SERVER_ERROR,
            HttpStatusDescriptionEnum.INTERNAL_SERVER_ERROR
        ));

    return Promise.resolve(true);
}

export async function updateFromUserActivePlanByStripeCustomerId(stripeCustomerId: string, updateStatement: {}): Promise<boolean> {
    let updatedUserActivePlanId = await cp('tbl_user_active_plan')
        .where('stripe_customer_id', stripeCustomerId)
        .update(updateStatement, 'stripe_customer_id');

    if (!Boolean(updatedUserActivePlanId))
        return Promise.reject(new RequestError(
            TTVAPIErrors.DATABASE_GENERAL_UNEXPECTED_INTERACTION,
            HttpStatusCodeEnum.INTERNAL_SERVER_ERROR,
            HttpStatusDescriptionEnum.INTERNAL_SERVER_ERROR
        ));

    return Promise.resolve(true);
}