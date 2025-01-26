import jwt from "jsonwebtoken";
export const createAccessToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.JWT_ACCESS_TOKEN as string, {
    expiresIn: "7d",
  });
};

export const decodeAccessToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_ACCESS_TOKEN as string) as {
    userId: string;
  };
};
