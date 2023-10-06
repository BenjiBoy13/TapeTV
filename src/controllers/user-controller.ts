import { Request, Response} from "express";

import { configuration as cf } from "../config";
import { TokenizedRequest } from "../extended-types/express";
import handleError from "../handlers/error-handler";
import RequestError from "../error/RequestError";
import { HttpHeadersEnum, HttpStatusCodeEnum, HttpStatusDescriptionEnum } from "../utils/enums/http-numerators";
import { emailVerification, getCompleteUserInfo, registerNewUser, sendEmailVerification } from "../services/user-service";
import TTVResponse from "../models/response/TTVResponse";
import IUserModel from "../models/IUserModel";
import {TTVAPIErrors} from "../utils/enums/business-numerators";

const INVALID_USER_ID = "Invalid user id";

export function postUser(req: Request, res: Response) {
    let userModel: IUserModel = req.body;

    if (!(userModel.name && userModel.surName && userModel.birthdate && userModel.username && userModel.email && userModel.password)) {
        handleError(req, res, new RequestError(
            TTVAPIErrors.REQUEST_GENERAL_INVALID_REQUEST_FIELDS,
            HttpStatusCodeEnum.BAD_REQUEST,
            HttpStatusDescriptionEnum.BAD_REQUEST
        ));

        return;
    }

    userModel.name = userModel.name.trim();
    userModel.surName = userModel.surName.trim();
    userModel.email = userModel.email.trim();
    userModel.username = userModel.username.trim();
    userModel.password = userModel.password.trim();

    if (!(
        userModel.username.match(/^[a-zA-Z0-9-_$]+$/) &&
        userModel.email.match(/^\s*[\w\-+_]+(?:\.[\w\-+_]+)*@[\w\-+_]+\.[\w\-+_]+(?:\.[\w\-+_]+)*\s*$/) &&
        userModel.password.match(/^[a-zA-Z0-9-_$?]+$/) &&
        userModel.name.match(/^[a-zA-Z ]+$/) &&
        userModel.surName.match(/^[a-zA-Z ]+$/) &&
        userModel.birthdate.match(/^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/)
    )) {
        handleError(req, res, new RequestError(
            TTVAPIErrors.REQUEST_GENERAL_INVALID_REQUEST_FIELDS,
            HttpStatusCodeEnum.BAD_REQUEST,
            HttpStatusDescriptionEnum.BAD_REQUEST
        ));

        return;
    }

    registerNewUser(userModel)
        .then(userId =>
            res.status(HttpStatusCodeEnum.CREATED)
                .setHeader(HttpHeadersEnum.LOCATION, `${cf.server.protocol}://${cf.server.host}:${cf.server.port}/users/${userId}`)
                .send()
        )
        .catch(err => handleError(req, res, err));
}

export function getUserById(req: Request, res: Response) {
    let tReq = req as TokenizedRequest;

    if (isNaN(Number(tReq.params.userId))) {
        handleError(req, res, new RequestError(
            INVALID_USER_ID,
            HttpStatusCodeEnum.BAD_REQUEST,
            HttpStatusDescriptionEnum.BAD_REQUEST
        ));

        return;
    }

    if (Number(tReq.params.userId) !== tReq.userId) {
        handleError(req, res, new RequestError(
            TTVAPIErrors.AUTHENTICATION_PROTECTED_RESOURCE,
            HttpStatusCodeEnum.UNAUTHORIZED,
            HttpStatusDescriptionEnum.UNAUTHORIZED
        ));

        return;
    }

    getCompleteUserInfo(tReq.userId).then(completeUserInfo => res
        .status(HttpStatusCodeEnum.OK)
        .json(new TTVResponse(HttpStatusCodeEnum.OK, HttpStatusDescriptionEnum.OK, completeUserInfo))
    ).catch(err => handleError(req, res, err));
}

export function actionSendEmailVerificationCode(req: Request, res: Response) {
    let tReq = req as TokenizedRequest;

    sendEmailVerification(tReq.userId)
        .then(message => res.status(HttpStatusCodeEnum.OK).send())
        .catch(err => handleError(req, res, err));
}

export function actionConfirmEmailVerificationCode(req: Request, res: Response) {
    let tReq = req as TokenizedRequest;
    let user: IUserModel = req.body;

    emailVerification(tReq.userId, Number(user.emailCode))
        .then(isOk => res.status(HttpStatusCodeEnum.OK).send())
        .catch(err => handleError(req, res, err));
}