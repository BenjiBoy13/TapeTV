export enum TTVPlansEnum {
    FREE = 1,
    AMATEUR = 3,
    LIBRARIAN = 4,
    COLLECTOR = 5,
}

export enum TTVPlansNameEnum {
    FREE = "Free",
    AMATEUR = "Amateur",
    LIBRARIAN = "Librarian",
    COLLECTOR = "Collector",
}

export enum TTVPlansStorageEnum {
    FREE = 2_147_483_648,
    AMATEUR = 107_374_182_400,
    LIBRARIAN = 536_870_912_000,
    COLLECTOR = 2_199_023_255_552
}

export enum TTVOnboardingStatus {
    USER_CREATED = 'USER_CREATED',
    EMAIL_VALIDATED = 'EMAIL_VALIDATED',
    PLAN_SELECTED = 'PLAN_SELECTED'
}

export enum TTVAPIErrors {
    AUTHENTICATION_INVALID_CREDENTIALS = "Invalid Credentials",
    AUTHENTICATION_INVALID_TOKEN = "Invalid Token",
    AUTHENTICATION_INVALID_ACCESS = "Unexpected authentication behaviour",
    AUTHENTICATION_PROTECTED_RESOURCE = "Unauthorized access to resource",
    AUTHORIZATION_CANNOT_SUBSCRIBE = "Unable to perform subscription on current user status",
    AUTHORIZATION_INVALID_PLAN = "Invalid plan",
    STRIPE_HOOK_KEY_ERROR = "Unexpected stripe signature validation in hook",
    USER_EMAIL_ALREADY_VALIDATED = "Email already validated",
    USER_INVALID_EMAIL_CODE = "Invalid email validation code",
    REQUEST_GENERAL_INVALID_REQUEST_FIELDS = "Invalid required fields",
    DATABASE_GENERAL_UNEXPECTED_INTERACTION = "Unexpected database interaction",
    DATABASE_GENERAL_EMPTY_RS = "No result set found"
}