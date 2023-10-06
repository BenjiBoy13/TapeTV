import express, { Router } from 'express';
import { actionHook } from "../controllers/stripe-controller";


const stripeRouter = Router();

stripeRouter.post('/hook', express.raw({ type: 'application/json' }), actionHook);

export default stripeRouter;