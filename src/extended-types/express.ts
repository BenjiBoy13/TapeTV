import { Request } from "express";
export interface TokenizedRequest extends Request {
    userId: number
}