import Router from 'express';

import { actionLogIn, actionRefreshToken} from "../controllers/authentication-controller";

const authenticationRouter = Router();

authenticationRouter.post('/sign-in', actionLogIn);
authenticationRouter.post("/refresh-token", actionRefreshToken);

export default authenticationRouter;