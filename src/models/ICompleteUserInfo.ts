import IUserModel from "./IUserModel";
import IModel from "./IModel";
import IUserActivePlan from "./IUserActivePlan";
import IPlan from "./IPlan";

export default interface ICompleteUserInfo extends IModel{
    user: IUserModel,
    activePlan: {
        currentSubscriptionInfo: IUserActivePlan,
        plan: IPlan
    }
}