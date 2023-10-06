import {
    selectFromUserActivePlanByUserActivePlanId,
    selectFromUserByUserId,
    updateFromUserByUserId
} from "../facades/user-facade";
import {TTVAPIErrors, TTVOnboardingStatus, TTVPlansEnum, TTVPlansNameEnum} from "../utils/enums/business-numerators";
import RequestError from "../error/RequestError";
import {HttpStatusCodeEnum, HttpStatusDescriptionEnum} from "../utils/enums/http-numerators";
import IUserModel from "../models/IUserModel";
import IUserActivePlan from "../models/IUserActivePlan";
import stripeClient from "../stripe-client";
import IStripeCheckoutModel from "../models/response/IStripeCheckoutModel";
import { Stripe } from "stripe";
import { StripeSubscriptionIntervalEnum } from "../utils/enums/stripe-numerators";

export async function subscribe(userId: number, planId: number, interval: StripeSubscriptionIntervalEnum): Promise<IStripeCheckoutModel> {
    let planName: string, user: IUserModel, userActivePlan: IUserActivePlan, product: Stripe.Product, price: Stripe.Price;

    if (planId === TTVPlansEnum.FREE) {
        await updateFromUserByUserId(userId, { onboarding_status: TTVOnboardingStatus.PLAN_SELECTED });
        return Promise.resolve({ url: "" });
    }

    switch (planId) {
        case TTVPlansEnum.AMATEUR:
            planName = TTVPlansNameEnum.AMATEUR
            break;
        case TTVPlansEnum.LIBRARIAN:
            planName = TTVPlansNameEnum.LIBRARIAN
            break;
        case TTVPlansEnum.COLLECTOR:
            planName = TTVPlansNameEnum.COLLECTOR
            break;
        default:
            planName = ""
            break;
    }

    if (planName === "")
        return Promise.reject(new RequestError(
            TTVAPIErrors.AUTHORIZATION_INVALID_PLAN,
            HttpStatusCodeEnum.BAD_REQUEST,
            HttpStatusDescriptionEnum.BAD_REQUEST
        ));

    user = await selectFromUserByUserId(userId, ['isEmailConfirmed', 'userActivePlanId']);

    if (!user.isEmailConfirmed)
        return Promise.reject(new RequestError(
            TTVAPIErrors.AUTHORIZATION_CANNOT_SUBSCRIBE,
            HttpStatusCodeEnum.NOT_ACCEPTABLE,
            HttpStatusDescriptionEnum.NOT_ACCEPTABLE
        ));

    userActivePlan = await selectFromUserActivePlanByUserActivePlanId(user.userActivePlanId, ['stripeCustomerId']);

    if (!userActivePlan || !userActivePlan.stripeCustomerId)
        return Promise.reject(new RequestError(
            TTVAPIErrors.AUTHORIZATION_CANNOT_SUBSCRIBE,
            HttpStatusCodeEnum.NOT_ACCEPTABLE,
            HttpStatusDescriptionEnum.NOT_ACCEPTABLE
        ));

    const selectedPlanProduct = await stripeClient.products.search(
        { query: `name:"${planName}"`, expand: ['data.default_price'] }
    );

    product = selectedPlanProduct.data[0];
    price = product.default_price as Stripe.Price;

    const session = await stripeClient.checkout.sessions.create(
        {
            success_url: "http://localhost:3001/success",
            line_items: [
                {
                    price_data: {
                        currency: 'mxn',
                        unit_amount: Number(price.unit_amount),
                        product: product.id,
                        recurring: {
                            interval: interval.toLowerCase() as Stripe.Checkout.SessionCreateParams.LineItem.PriceData.Recurring.Interval
                        }
                    },
                    quantity: 1
                }
            ],
            mode: 'subscription',
            customer: userActivePlan.stripeCustomerId,
            client_reference_id: userActivePlan.stripeCustomerId
        }
    );

    return Promise.resolve({ url: String(session.url) });
}