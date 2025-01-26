import "express";

declare global {
  namespace Express {
    interface Request {
      userId: string;
      token: string;
    }
  }
}

declare module "express" {
  interface Request {
    userId: string;
    token: string;
  }
}
