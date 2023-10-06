import { Request, Response } from "express";

import IUserModel from "../models/IUserModel";
import handleError from "../handlers/error-handler";
import RequestError from "../error/RequestError";
import { HttpStatusCodeEnum, HttpStatusDescriptionEnum } from "../utils/enums/http-numerators";
import { logIn, refreshToken } from "../services/authentication-service";
import TTVResponse from "../models/response/TTVResponse";
import ITokenModel from "../models/ITokenModel";
import { TTVAPIErrors } from "../utils/enums/business-numerators";

export function actionLogIn(req: Request, res: Response) {
    let user: IUserModel = req.body;

    if (!(user.password && (user.username || user.email))) {
        handleError(req, res, new RequestError(
            TTVAPIErrors.AUTHENTICATION_INVALID_CREDENTIALS,
            HttpStatusCodeEnum.BAD_REQUEST,
            HttpStatusDescriptionEnum.BAD_REQUEST
        ));

        return;
    }

    user.username = user.username ? user.username.trim() : '';
    user.email = user.email ? user.email.trim() : '';
    user.password = user.password.trim();

    logIn(user.username, user.password, user.password)
        .then(tokens => res.status(HttpStatusCodeEnum.OK).json(new TTVResponse(HttpStatusCodeEnum.OK, HttpStatusDescriptionEnum.OK, tokens)))
        .catch(err => handleError(req, res, err));
}

export function actionRefreshToken(req: Request, res: Response) {
    let token: ITokenModel = req.body;

    if (!(token.refreshToken)) {
        handleError(req, res, new RequestError(
            TTVAPIErrors.AUTHENTICATION_INVALID_TOKEN,
            HttpStatusCodeEnum.BAD_REQUEST,
            HttpStatusDescriptionEnum.BAD_REQUEST
        ));

        return;
    }

    refreshToken(token.refreshToken)
        .then(tokens => res.status(HttpStatusCodeEnum.OK).json(new TTVResponse(HttpStatusCodeEnum.OK, HttpStatusDescriptionEnum.OK, tokens)))
        .catch(err => handleError(req, res, err));
}