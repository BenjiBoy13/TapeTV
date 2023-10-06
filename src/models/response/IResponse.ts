import IModel from "../IModel";

export default interface IResponse {
    statusCode: number;
    type: string;
    data: IModel;
};