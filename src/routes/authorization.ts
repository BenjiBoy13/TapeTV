import Router from 'express';

import { actionSubscribe } from "../controllers/authorization-controller";

const authorizationRouter = Router();

authorizationRouter.post('/subscribe', actionSubscribe);

export default authorizationRouter;