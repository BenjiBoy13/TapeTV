import { NextFunction, Request, Response } from "express";

import {HttpHeadersEnum, HttpMethodsEnum, HttpStatusCodeEnum, HttpStatusDescriptionEnum}
    from "../utils/enums/http-numerators";
import handleError from "../handlers/error-handler";
import RequestError from "../error/RequestError";
import { configuration as cf } from "../config";
import redisClient from "../redis-client";
import ITokenModel from "../models/ITokenModel";
import { verifyToken } from "../utils/security-utils";
import {TokenizedRequest} from "../extended-types/express";
import {TTVAPIErrors} from "../utils/enums/business-numerators";

export function authorizeIncomingRequest (req: Request, res: Response, next: NextFunction) {
    let bearerToken: string | undefined = req.header(HttpHeadersEnum.AUTHORIZATION), redisToken: ITokenModel;

    if (
        (req.path === "/users" && req.method === HttpMethodsEnum.POST) ||
        (req.path === "/authentication/sign-in" && req.method === HttpMethodsEnum.POST) ||
        (req.path === "/authentication/refresh-token" && req.method === HttpMethodsEnum.POST) ||
        (req.path === "/stripe/hook" && req.method === HttpMethodsEnum.POST)
    ) {
        next();
        return;
    }

    let tReq = req as TokenizedRequest;

    if (!bearerToken) {
        handleError(req, res, new RequestError(
            "Authorization header not found",
            HttpStatusCodeEnum.FORBIDDEN,
            HttpStatusDescriptionEnum.FORBIDDEN
        ));

        return;
    }

    if (String(bearerToken).slice(0, 7) !== "Bearer ") {
        handleError(req, res, new RequestError(
           "Authorization header in wrong format",
           HttpStatusCodeEnum.FORBIDDEN,
           HttpStatusDescriptionEnum.FORBIDDEN
        ));

        return;
    }

    verifyToken(bearerToken.slice(7), String(cf.jwt.secretPassphrase))
        .then(userId => {
            tReq.userId = userId;

            return redisClient.get(String(userId));
        })
        .then(value => {
            if (!value)
                throw new RequestError(
                    TTVAPIErrors.AUTHENTICATION_INVALID_ACCESS,
                    HttpStatusCodeEnum.UNAUTHORIZED,
                    HttpStatusDescriptionEnum.UNAUTHORIZED
                );

            redisToken = JSON.parse(value);

            if (redisToken.token !== String(bearerToken).slice(7))
                throw new RequestError(
                    TTVAPIErrors.AUTHENTICATION_INVALID_ACCESS,
                    HttpStatusCodeEnum.UNAUTHORIZED,
                    HttpStatusDescriptionEnum.UNAUTHORIZED
                );

            next();
        })
        .catch(err => handleError(req, res, err));
}