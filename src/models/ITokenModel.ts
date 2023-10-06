import IModel from "./IModel";

export default interface ITokenModel extends IModel {
    token: string,
    refreshToken: string
}