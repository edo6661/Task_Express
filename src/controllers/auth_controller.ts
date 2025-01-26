import { RequestHandler } from "express";
import { createErrorRes, createSuccessRes } from "../utils/api_response";
import { db } from "../lib/db/database";
import { NewUser, users } from "../lib/db/schema";
import { eq } from "drizzle-orm";
import { RequestSignIn, RequestSignUp } from "../types/auth";
import bcrypt from "bcryptjs";
import { HttpStatusCode } from "../types/api";
import { validateEmpty } from "../utils/validation";
import logger from "../lib/logger";
import { createAccessToken, decodeAccessToken } from "../lib/token";
export const register: RequestHandler = async (req: RequestSignUp, res) => {
  try {
    const { email, password, name } = req.body;
    if (
      validateEmpty(email) &&
      validateEmpty(password) &&
      validateEmpty(name)
    ) {
      createErrorRes(res, "Email, password, and name are required", 400);
      return;
    }

    const emailExist = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    if (emailExist.length) {
      createErrorRes(res, "Email already exist", 400);
    }
    const hashedPassword = await bcrypt.hash(password, 8);
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        password: hashedPassword,
        name,
      })
      .returning();

    const { password: _, ...newUserWithoutPassword } = newUser;
    createSuccessRes(res, {
      data: newUserWithoutPassword,
      message: "Successfully registered",
      statusCode: HttpStatusCode.CREATED,
    });
  } catch (error) {
    logger.info("test");
    logger.error(error);
    createErrorRes(res, error);
  }
};

export const login: RequestHandler = async (req: RequestSignIn, res) => {
  try {
    if (validateEmpty(req.body.email) && validateEmpty(req.body.password)) {
      createErrorRes(res, "Email and password are required", 400);
      return;
    }
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, req.body.email));
    if (!existingUser) {
      createErrorRes(res, "Wrong Credentials", 400);
      return;
    }
    const isMatch = await bcrypt.compare(
      req.body.password,
      existingUser.password
    );
    if (!isMatch) {
      createErrorRes(res, "Wrong Credentials", 400);
      return;
    }
    const { password: _, ...userWithoutPassword } = existingUser;
    const token = createAccessToken(existingUser.id);

    createSuccessRes(res, {
      data: {
        user: userWithoutPassword,
        token,
      },
      message: "Successfully logged in",
      statusCode: HttpStatusCode.OK,
    });
  } catch (error) {
    createErrorRes(res, error);
  }
};
export const isTokenValid: RequestHandler = async (req, res) => {
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
    createSuccessRes(res, {
      data: true,
      statusCode: HttpStatusCode.OK,
      message: "Token is valid",
    });
  } catch (error) {
    createErrorRes(res, error);
  }
};

export const self: RequestHandler = async (req, res) => {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, req.userId));
    if (!user) {
      createErrorRes(res, "User not found", HttpStatusCode.NOT_FOUND);
      return;
    }
    const { password: _, ...userWithoutPassword } = user;
    createSuccessRes(res, {
      data: userWithoutPassword,
      message: "Successfully get self",
      statusCode: HttpStatusCode.OK,
    });
  } catch (error) {
    createErrorRes(res, error);
  }
};
