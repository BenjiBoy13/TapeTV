import jwt, { JsonWebTokenError, NotBeforeError, TokenExpiredError } from 'jsonwebtoken';

import RequestError from "../error/RequestError";
import {HttpStatusCodeEnum, HttpStatusDescriptionEnum} from "./enums/http-numerators";
import IJwtPayLoad from "../models/IJwtPayLoad";

export async function verifyToken (token: string, passphrase: string): Promise<number> {
    return new Promise((resolve, reject) => {
        let user: IJwtPayLoad;

        jwt.verify(token, passphrase, (error, decoded) => {
            if (error instanceof TokenExpiredError) {
                reject(new RequestError(
                    "Token is expired",
                    HttpStatusCodeEnum.UNAUTHORIZED,
                    HttpStatusDescriptionEnum.UNAUTHORIZED
                ));

                return;
            }

            if (error instanceof NotBeforeError) {
                reject(new RequestError(
                    "Token nbf claim compromised",
                    HttpStatusCodeEnum.UNAUTHORIZED,
                    HttpStatusDescriptionEnum.UNAUTHORIZED
                ));

                return;
            }

            if (error instanceof JsonWebTokenError) {
                reject(new RequestError(
                    "Token is invalid",
                    HttpStatusCodeEnum.UNAUTHORIZED,
                    HttpStatusDescriptionEnum.UNAUTHORIZED
                ));

                return;
            }

            user = <IJwtPayLoad> decoded;

            if (!user.userId) {
                reject(new RequestError(
                    "Unexpected token payload",
                    HttpStatusCodeEnum.UNAUTHORIZED,
                    HttpStatusDescriptionEnum.UNAUTHORIZED
                ));

                return;
            }

            resolve(user.userId);
        });
    });
}