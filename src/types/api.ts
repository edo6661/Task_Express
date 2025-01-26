import { Request } from "express";

export type RequestBody<T> = Request<{}, {}, T>;
export type RequestParams<T> = Request<T, {}, {}>;
export type RequestQuery<T> = Request<{}, T, {}>;
export type RequestBodyParams<T, U> = Request<T, {}, U>;

export enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

export type Errors = string[] | { message: string; type?: string }[];

export type SuccessOptions<T> = {
  data?: T;
  message?: string;
  statusCode?: HttpStatusCode;
};

export interface ApiRes<T> {
  statusCode: number;
  message: string;
  data?: T;
  errors?: Errors;
}
