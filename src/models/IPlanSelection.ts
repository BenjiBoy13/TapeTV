import IPlan from "./IPlan";
import { StripeSubscriptionIntervalEnum } from "../utils/enums/stripe-numerators";

export default interface IPlanSelection extends IPlan {
    interval: StripeSubscriptionIntervalEnum
}