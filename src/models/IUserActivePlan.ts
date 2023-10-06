import { StripeSubscriptionIntervalEnum, StripeSubscriptionStatusEnum } from "../utils/enums/stripe-numerators";

export default interface IUserActivePlan {
    planId: number,
    usedStorage: number,
    availableStorage: number,
    renewalMethod: StripeSubscriptionIntervalEnum,
    periodStartAt: Date,
    periodEndAt: Date,
    status: StripeSubscriptionStatusEnum,
    paidAmountForPeriod: number,
    periodDiscount: number,
    stripeCustomerId: string,
    isLocked: boolean
}