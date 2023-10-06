import bcrypt from "bcrypt";

import {
    insertUserWithActivePlan,
    selectFromUserActivePlanByUserActivePlanId,
    selectFromUserByUserId, updateFromUserActivePlanByUserActivePlanId,
    updateFromUserByUserId
} from "../facades/user-facade";
import IUserModel from "../models/IUserModel";
import {
    HttpStatusCodeEnum,
    HttpStatusDescriptionEnum
} from "../utils/enums/http-numerators";
import RequestError from "../error/RequestError";
import mailTransport from "../nodemailer-client";
import ICompleteUserInfo from "../models/ICompleteUserInfo";
import { getPlanByPlanId } from "./plan-service";
import { TTVAPIErrors, TTVOnboardingStatus } from "../utils/enums/business-numerators";
import stripeClient from "../stripe-client";
import log from "../bunyan-logger";

export async function registerNewUser(userModel: IUserModel): Promise<number> {
    try {
        userModel.password = await bcrypt.hash(userModel.password, 10);
        userModel.userId = await insertUserWithActivePlan(userModel);
        return Promise.resolve(userModel.userId);
    } catch (err) {
        return Promise.reject(err);
    }
}

export async function getCompleteUserInfo(userId: number): Promise<ICompleteUserInfo> {
    try {
        let user = await selectFromUserByUserId(userId, [
            'name', 'surName', 'birthdate', 'email',
            'isEmailConfirmed', 'username', 'userActivePlanId', 'createdAt']
        );

        let userActivePlan = await selectFromUserActivePlanByUserActivePlanId(user.userActivePlanId, [
            'planId', 'usedStorage', 'availableStorage', 'renewalMethod',
            'periodStartAt', 'periodEndAt', 'status', 'paidAmountForPeriod',
            'periodDiscount', 'isLocked']
        );

        userActivePlan.paidAmountForPeriod = Number(userActivePlan.paidAmountForPeriod);

        let plan = await getPlanByPlanId(userActivePlan.planId)

        return Promise.resolve({
            user: user,
            activePlan: {
                currentSubscriptionInfo: userActivePlan,
                plan: plan
            }
        });
    } catch (err) {
        return Promise.reject(err);
    }
}

export async function sendEmailVerification (userId: number): Promise<boolean> {
    try {
        let randomCode = Math.floor(Math.random() * 900000) + 100000;

        let user = await selectFromUserByUserId(userId, ['email', 'isEmailConfirmed', 'emailCode']);

        if (user.isEmailConfirmed)
            return Promise.reject(new RequestError(
                TTVAPIErrors.USER_EMAIL_ALREADY_VALIDATED,
                HttpStatusCodeEnum.BAD_REQUEST,
                HttpStatusDescriptionEnum.BAD_REQUEST
            ));

        await updateFromUserByUserId(userId, { email_code: randomCode });

        mailTransport.sendMail({
            from: "no-reply@tapetv.net",
            to: user.email,
            subject: "TTV | Email Verification Code",
            text: "Here's your code for email verification: " + String(randomCode)
        })
            .then(messageInfo => log.info({ emailSentTo: user.email, sent: true }, messageInfo))
            .catch(err => log.warn({ emailSentTo: user.email, sent: false }, err));

        return Promise.resolve(true);
    } catch (err) {
        return Promise.reject(err);
    }
}

export async function emailVerification (userId: number, code: number): Promise<boolean> {
    try {
        let updateStatement = {
            is_email_confirmed: 1,
            email_code: null,
            onboarding_status: TTVOnboardingStatus.EMAIL_VALIDATED
        };

        let user = await selectFromUserByUserId(userId, ['emailCode', 'isEmailConfirmed', 'name', 'surName', 'email', 'userActivePlanId']);

        if (user.emailCode !== code)
            return Promise.reject(new RequestError(
                TTVAPIErrors.USER_INVALID_EMAIL_CODE,
                HttpStatusCodeEnum.BAD_REQUEST,
                HttpStatusDescriptionEnum.BAD_REQUEST
            ));

        if (user.isEmailConfirmed)
            return Promise.reject(new RequestError(
                TTVAPIErrors.USER_EMAIL_ALREADY_VALIDATED,
                HttpStatusCodeEnum.BAD_REQUEST,
                HttpStatusDescriptionEnum.BAD_REQUEST
            ));

        let stripeCustomerId = await stripeClient.customers.create({
            name: `${user.name} ${user.surName}`,
            email: `${user.email}`
        });

        await updateFromUserByUserId(userId, updateStatement);
        await updateFromUserActivePlanByUserActivePlanId(user.userActivePlanId, { stripe_customer_id: stripeCustomerId.id });

        return Promise.resolve(true);
    } catch (err) {
        return Promise.reject(err);
    }
}