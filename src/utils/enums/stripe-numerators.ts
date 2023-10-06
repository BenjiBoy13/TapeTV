export const enum StripeSubscriptionStatusEnum {
    ACTIVE = "ACTIVE",
    PAST_DUE = "PAST_DUE",
    UNPAID = "UNPAID",
    CANCELED = "CANCELED",
    INCOMPLETE = "INCOMPLETE",
    INCOMPLETE_EXPIRED = "INCOMPLETE_EXPIRED",
    TRIALING = "TRIALING",
    PAUSED = "PAUSED"
}

export const enum StripeSubscriptionIntervalEnum {
    NEVER = "NEVER", // Custom value for TTV Only
    MONTH = "MONTH",
    YEAR = "YEAR",
    WEEK = "WEEK",
    DAY = "DAY"
}

export const enum StripeChargeStatusEnum {
    SUCCEEDED = "SUCCEEDED",
    PENDING = "PENDING",
    FAILED = "FAILED"
}