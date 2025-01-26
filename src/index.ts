import express from "express";
import dotenv from "dotenv";
import authRouter from "./routes/auth_route";
import compression from "compression";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { pool } from "./lib/db/database";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import morgan from "morgan";
import logger from "./lib/logger";
import taskRouter from "./routes/task_route";

dotenv.config();
const app = express();

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(
  compression({
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) {
        return false;
      }
      return compression.filter(req, res);
    },
    level: 6,
    threshold: 10 * 1000,
  })
);
app.use(hpp());
app.use(cors());
app.use(helmet());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const v1Router = express.Router();
app.use("/api/v1", v1Router);
v1Router.use("/auth", authRouter);
v1Router.use("/tasks", taskRouter);

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    logger.error(err.stack);
    res.status(500).json({
      error:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Internal Server Error",
    });
    next();
  }
);
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
});

pool.on("connect", () => logger.info("Connected to pool."));
pool.on("remove", () => logger.info("Client removed from pool."));
pool.on("error", (err) => logger.error("Error in pool", err));

const PORT = process.env.PORT;
const server = app.listen(PORT, () => {
  logger.info(`http://localhost:${PORT}/api/v1`);
});

const gracefulShutdown = () => {
  logger.info("SIGTERM signal received");
  server.close(() => {
    logger.info("Server closed");
    process.exit(0);
  });
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
export default app;
