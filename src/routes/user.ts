import Router from 'express';

import {
    actionConfirmEmailVerificationCode,
    actionSendEmailVerificationCode,
    getUserById,
    postUser
} from "../controllers/user-controller";

const userRouter = Router();

userRouter.get('/:userId', getUserById);
userRouter.post('/', postUser);
userRouter.post('/send-email-verification', actionSendEmailVerificationCode);
userRouter.post('/email-verification', actionConfirmEmailVerificationCode);

export default userRouter;