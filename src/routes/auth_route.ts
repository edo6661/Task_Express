import { Router } from "express";
import { login, register } from "../controllers/auth_controller";
import { authMiddleware } from "../middlewares/auth_middleware";

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);

export default authRouter;
