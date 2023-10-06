export default class RequestError extends Error {

    statusCode: number;
    statusTitle: string;

    constructor(message: string, statusCode: number, statusTitle: string) {
        super(message);
        this.statusCode = statusCode;
        this.statusTitle = statusTitle;
    };

}