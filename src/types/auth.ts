import { Request } from "express";
import { NewUser, User } from "../lib/db/schema";
export type RequestSignUp = Request<{}, {}, NewUser>;
export type RequestSignIn = Request<{}, {}, Pick<User, "email" | "password">>;
