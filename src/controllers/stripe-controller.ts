import { Request, Response } from "express";
import handleError from "../handlers/error-handler";
import RequestError from "../error/RequestError";
import {HttpStatusCodeEnum, HttpStatusDescriptionEnum} from "../utils/enums/http-numerators";
import { TTVAPIErrors } from "../utils/enums/business-numerators";
import {handleHookEvent} from "../services/stripe-service";

export function actionHook(req: Request, res: Response) {
    const stripeSignature = req.headers['stripe-signature'];

    if (!stripeSignature)
        handleError(req, res, new RequestError(
            HttpStatusDescriptionEnum.UNAUTHORIZED,
            HttpStatusCodeEnum.UNAUTHORIZED,
            TTVAPIErrors.AUTHENTICATION_PROTECTED_RESOURCE
        ));

    handleHookEvent(req.body, stripeSignature)
        .then(ok => res.status(HttpStatusCodeEnum.OK).send())
        .catch(err => handleError(req, res, err));

}