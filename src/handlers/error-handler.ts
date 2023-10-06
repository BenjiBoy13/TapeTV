import { Request, Response } from "express";
import RequestError from "../error/RequestError";
import TTVErrorResponse from "../models/response/TTVErrorResponse";
import { HttpStatusCodeEnum, HttpStatusDescriptionEnum } from "../utils/enums/http-numerators";
import log from '../bunyan-logger';

export default function handleError(req: Request, res: Response, err: RequestError | any) {
    if (err instanceof RequestError) {
        log.warn({ ip: req.ip, path: req.path, method: req.method, status: err.statusCode }, err.message);

        res.status(err.statusCode)
            .json(new TTVErrorResponse(err.statusTitle, err.statusCode, err.message))
            .end();

        return;
    }

    log.error({ ip: req.ip, path: req.path, method: req.method, status: HttpStatusCodeEnum.INTERNAL_SERVER_ERROR }, req.body, err);

    res.status(HttpStatusCodeEnum.INTERNAL_SERVER_ERROR)
        .json(new TTVErrorResponse(
            HttpStatusDescriptionEnum.INTERNAL_SERVER_ERROR,
            HttpStatusCodeEnum.INTERNAL_SERVER_ERROR,
            "Unexpected server error"
        ))
        .end();
};