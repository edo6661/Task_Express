import { Router } from "express";
import { login, register, self } from "../controllers/auth_controller";
import { authMiddleware } from "../middlewares/auth_middleware";

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.get("/", authMiddleware, self);

export default authRouter;
