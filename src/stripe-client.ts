import Stripe from 'stripe';
import { configuration as cf } from "./config";

const stripeClient = new Stripe(String(cf.stripe.secretKey), { apiVersion: "2022-11-15" });

export default stripeClient;

