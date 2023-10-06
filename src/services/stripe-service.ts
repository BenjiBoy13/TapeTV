import stripeClient from "../stripe-client";
import {configuration as cf} from "../config";
import Stripe from "stripe";
import {
    selectFromUserActivePlanByStripeCustomerId,
    updateFromUserActivePlanByStripeCustomerId
} from "../facades/user-facade";
import {TTVPlansEnum, TTVPlansNameEnum, TTVPlansStorageEnum} from "../utils/enums/business-numerators";
import {StripeChargeStatusEnum, StripeSubscriptionStatusEnum} from "../utils/enums/stripe-numerators";
import IUserActivePlan from "../models/IUserActivePlan";

export async function handleHookEvent(payload: any, signature: string | string[] | undefined): Promise<boolean> {
    try {
        // @ts-ignore
        let event = stripeClient.webhooks.constructEvent(payload, signature, cf.stripe.hookSignatureSecret);
        let userActivePlanUpdateStatement: {};

        switch (event.type) {
            case "customer.subscription.created":
            case "customer.subscription.updated":
            case "customer.subscription.deleted":
                let
                    selectedPlanId: number,
                    availableStorage: number,
                    currentStatus: StripeSubscriptionStatusEnum,
                    isLocked: boolean,
                    subscription: Stripe.Subscription,
                    subscriptionItem: Stripe.SubscriptionItem,
                    userActivePlan: IUserActivePlan,
                    stripeCustomerId: string,
                    product: Stripe.Product,
                    planName: TTVPlansNameEnum

                isLocked = false;
                subscription = event.data.object as Stripe.Subscription;
                subscriptionItem = subscription.items.data.at(0) as Stripe.SubscriptionItem;
                product = await stripeClient.products.retrieve(String(subscriptionItem.plan.product));
                stripeCustomerId = String(subscription.customer);

                userActivePlan = await selectFromUserActivePlanByStripeCustomerId(stripeCustomerId, ['usedStorage', 'isLocked', 'period_end_at']);

                currentStatus = subscription.status.toUpperCase() as StripeSubscriptionStatusEnum;
                planName = product.name as TTVPlansNameEnum;

                switch (planName) {
                    case TTVPlansNameEnum.AMATEUR:
                        selectedPlanId = TTVPlansEnum.AMATEUR;
                        availableStorage = TTVPlansStorageEnum.AMATEUR;
                        break;
                    case TTVPlansNameEnum.LIBRARIAN:
                        selectedPlanId = TTVPlansEnum.LIBRARIAN;
                        availableStorage = TTVPlansStorageEnum.LIBRARIAN;
                        break;
                    case TTVPlansNameEnum.COLLECTOR:
                        selectedPlanId = TTVPlansEnum.COLLECTOR;
                        availableStorage = TTVPlansStorageEnum.COLLECTOR;
                        break;
                    default:
                        selectedPlanId = 1;
                        availableStorage = TTVPlansStorageEnum.FREE;
                        break;
                }

                if (
                    currentStatus === StripeSubscriptionStatusEnum.INCOMPLETE_EXPIRED ||
                    currentStatus === StripeSubscriptionStatusEnum.UNPAID ||
                    currentStatus === StripeSubscriptionStatusEnum.CANCELED
                ) {
                    selectedPlanId = TTVPlansEnum.FREE;
                    availableStorage = TTVPlansStorageEnum.FREE
                }

                // Overflow because of non-healthy subscription downgrade or downgraded paid plan
                // User will never be locked if he does not bypass the downgraded plan storage restrictions
                if (availableStorage < userActivePlan.usedStorage)
                    isLocked = true;

                userActivePlanUpdateStatement = {
                    renewal_method: subscriptionItem.plan.interval.toUpperCase(),
                    period_start_at: new Date(subscription.current_period_start * 1000),
                    period_end_at: new Date(subscription.current_period_end * 1000),
                    status: currentStatus,
                    plan_id: selectedPlanId,
                    available_storage: availableStorage,
                    is_locked: isLocked ? 1 : 0
                };

                await updateFromUserActivePlanByStripeCustomerId(stripeCustomerId, userActivePlanUpdateStatement);

                break;
            case "charge.succeeded":
            case "charge.failed":
                let charge: Stripe.Charge = event.data.object as Stripe.Charge;
                let chargeStatus = charge.status.toUpperCase() as StripeChargeStatusEnum;

                userActivePlanUpdateStatement = {
                    paid_amount_for_period: chargeStatus === StripeChargeStatusEnum.SUCCEEDED ? charge.amount / 100 : 0.00
                }

                await updateFromUserActivePlanByStripeCustomerId(String(charge.customer), userActivePlanUpdateStatement);

                break;
            default:
                break;
        }

        return Promise.resolve(true);
    } catch (err) {
        return Promise.reject(err);
    }
}