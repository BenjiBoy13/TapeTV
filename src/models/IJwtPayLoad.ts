import { JwtPayload } from "jsonwebtoken";

export default interface IJwtPayLoad extends JwtPayload {
    userId: number
}