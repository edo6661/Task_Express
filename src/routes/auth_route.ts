import { Router } from "express";
import {
  isTokenValid,
  login,
  register,
  self,
} from "../controllers/auth_controller";
import { authMiddleware } from "../middlewares/auth_middleware";

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/isTokenValid", isTokenValid);
authRouter.get("/", authMiddleware, self);

export default authRouter;
