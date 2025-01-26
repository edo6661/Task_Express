import { Response } from "express";
import { ApiRes, Errors, HttpStatusCode, SuccessOptions } from "../types/api";

export const createSuccessRes = <T>(
  res: Response,
  options: SuccessOptions<T>
): Response => {
  const { data, message = "Success", statusCode = HttpStatusCode.OK } = options;
  const ApiRes: ApiRes<T> = {
    statusCode,
    message,
    ...(data !== undefined && { data }),
  };
  return res.status(statusCode).json(ApiRes);
};

export const getErrorMsg = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error) {
    return String((error as any).message);
  }
  return typeof error === "string" ? error : "An unknown error occurred";
};

export const createErrorRes = (
  res: Response,
  message: unknown,
  statusCode: HttpStatusCode = HttpStatusCode.INTERNAL_SERVER_ERROR,
  errors?: Errors
): Response => {
  const ApiRes: ApiRes<never> = {
    statusCode,
    message: getErrorMsg(message),
    ...(errors && { errors }),
  };
  return res.status(statusCode).json(ApiRes);
};
