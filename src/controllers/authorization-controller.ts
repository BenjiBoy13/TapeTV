import { Request, Response } from "express";
import {TokenizedRequest} from "../extended-types/express";
import { subscribe } from "../services/authorization-service";
import TTVResponse from "../models/response/TTVResponse";
import {HttpStatusCodeEnum, HttpStatusDescriptionEnum} from "../utils/enums/http-numerators";
import handleError from "../handlers/error-handler";
import IPlanSelection from "../models/IPlanSelection";
import {StripeSubscriptionIntervalEnum} from "../utils/enums/stripe-numerators";
import RequestError from "../error/RequestError";
import {TTVAPIErrors} from "../utils/enums/business-numerators";

export function actionSubscribe(req: Request, res: Response) {
    let tReq = req as TokenizedRequest;
    let plan: IPlanSelection = req.body;

    if (!plan.planId || !plan.interval) {
        handleError(req, res, new RequestError(
            TTVAPIErrors.REQUEST_GENERAL_INVALID_REQUEST_FIELDS,
            HttpStatusCodeEnum.BAD_REQUEST,
            HttpStatusDescriptionEnum.BAD_REQUEST
        ));

        return;
    }

    subscribe(tReq.userId, Number(plan.planId), plan.interval.toUpperCase() as StripeSubscriptionIntervalEnum)
        .then(url => res.status(200).json(new TTVResponse(HttpStatusCodeEnum.OK, HttpStatusDescriptionEnum.OK, url)))
        .catch(err => handleError(req, res, err));
}