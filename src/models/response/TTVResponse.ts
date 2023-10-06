import IResponse from "./IResponse";
import IModel from "../IModel";

export default class TTVResponse implements IResponse {
    statusCode: number;

    type: string;

    data: IModel;

    constructor(statusCode: number, type: string, data: IModel) {
        this.statusCode = statusCode;
        this.type = type;
        this.data = data;
    }
}