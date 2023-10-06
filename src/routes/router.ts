import Router from 'express';
import userRouter from "./user";
import authenticationRouter from "./authentication";
import authorizationRouter from "./authorization";
import stripeRouter from "./stripe";

const router = Router();

router.use('/users', userRouter)
router.use('/authentication', authenticationRouter);
router.use('/authorization', authorizationRouter);
router.use('/stripe', stripeRouter)
export default router;