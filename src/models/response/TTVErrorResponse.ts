import IErrorResponse from "./IErrorResponse";

export default class TTVErrorResponse implements IErrorResponse {
    title: string;
    status: number;
    detail: string;

    constructor(title: string, status: number, detail: string) {
        this.title = title;
        this.status = status;
        this.detail = detail;
    }
}