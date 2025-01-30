import { Router } from "express";
import { authMiddleware } from "../middlewares/auth_middleware";
import {
  createTask,
  deleteTask,
  getTasks,
  syncTask,
  updateTask,
} from "../controllers/task_controller";

const taskRouter = Router();

taskRouter.use(authMiddleware);

taskRouter.get("/", getTasks);
taskRouter.post("/", createTask);
taskRouter.patch("/:id", updateTask);
taskRouter.delete("/:id", deleteTask);
taskRouter.post("/sync", syncTask);
export default taskRouter;
