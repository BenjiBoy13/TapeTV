import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { HttpStatusCodeEnum, HttpStatusDescriptionEnum } from "../utils/enums/http-numerators";
import { selectFromUserByUsernameOrEmail } from "../facades/user-facade";
import { configuration as cf } from "../config";
import RequestError from "../error/RequestError";
import redisClient from "../redis-client";
import ITokenModel from "../models/ITokenModel";
import { verifyToken } from "../utils/security-utils";
import { TTVAPIErrors } from "../utils/enums/business-numerators";

export async function logIn(username: string, email: string, password: string): Promise<ITokenModel> {
    try {
        let user = await selectFromUserByUsernameOrEmail(username, email, ['userId', 'password']);
        let isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect)
            return Promise.reject(new RequestError(
                TTVAPIErrors.AUTHENTICATION_INVALID_CREDENTIALS,
                HttpStatusCodeEnum.UNAUTHORIZED,
                HttpStatusDescriptionEnum.UNAUTHORIZED
            ));

        let tokens = await generateJWTTokens(user.userId);

        await redisClient.set(String(user.userId), JSON.stringify(tokens));

        return Promise.resolve(tokens);
    } catch (err) {
        return Promise.reject(err);
    }
}

export async function refreshToken (refreshToken: string): Promise<ITokenModel> {
    try {
        let tokenizedUserId = await verifyToken(refreshToken, String(cf.jwt.secretRefreshPassphrase));
        let redisUserRegistry = await redisClient.get(String(tokenizedUserId));

        if (!redisUserRegistry)
            return Promise.reject(new RequestError(
                TTVAPIErrors.AUTHENTICATION_INVALID_ACCESS,
                HttpStatusCodeEnum.UNAUTHORIZED,
                HttpStatusDescriptionEnum.UNAUTHORIZED
            ));

        let parsedRedisUserRegistry: ITokenModel = JSON.parse(redisUserRegistry);

        if (refreshToken !== parsedRedisUserRegistry.refreshToken)
            return Promise.reject(new RequestError(
                TTVAPIErrors.AUTHENTICATION_INVALID_ACCESS,
                HttpStatusCodeEnum.UNAUTHORIZED,
                HttpStatusDescriptionEnum.UNAUTHORIZED
            ));

        let tokens = await generateJWTTokens(tokenizedUserId);

        await redisClient.set(String(tokenizedUserId), JSON.stringify(tokens));

        return Promise.resolve(tokens);
    } catch (err) {
        return Promise.reject(err);
    }
}

async function generateJWTTokens (userId: number): Promise<ITokenModel> {
    return new Promise((resolve, reject) => {
       jwt.sign(
           { userId: userId },
           String(cf.jwt.secretPassphrase),
           { expiresIn: cf.jwt.tokenLife },
           (error, jwtEncoded) => {
               if (error) reject(error);
               jwt.sign(
                   { userId: userId },
                   String(cf.jwt.secretRefreshPassphrase),
                   { expiresIn: cf.jwt.refreshTokenLife },
                   (error, jwtRefreshEncoded) => {
                       if (error) reject(error);
                       resolve({ token: String(jwtEncoded), refreshToken: String(jwtRefreshEncoded) });
                   }
               );
           }
       );
    });
}