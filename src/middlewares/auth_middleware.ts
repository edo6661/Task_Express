import { RequestHandler } from "express";
import { createErrorRes, createSuccessRes } from "../utils/api_response";
import { db } from "../lib/db/database";
import { users } from "../lib/db/schema";
import { eq } from "drizzle-orm";
import { HttpStatusCode } from "../types/api";
import { decodeAccessToken } from "../lib/token";
export const authMiddleware: RequestHandler = async (req, res, next) => {
  try {
    const token = req.header("x-token");
    if (!token) {
      createErrorRes(
        res,
        "No token, authorization denied",
        HttpStatusCode.UNAUTHORIZED
      );
      return;
    }
    const { userId } = decodeAccessToken(token);
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      createErrorRes(res, "Token is not valid", HttpStatusCode.UNAUTHORIZED);
      return;
    }

    req.userId = userId;
    req.token = token;
    next();
  } catch (error) {
    createErrorRes(res, error);
  }
};
