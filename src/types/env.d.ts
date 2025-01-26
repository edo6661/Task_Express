declare global {
  namespace NodeJs {
    interface ProcessEnv {
      NODE_ENV: "development" | "production" | "test";
      PORT: string;
      DATABASE_URL: string;
      DATABASE_USER: string;
      DATABASE_PASSWORD: string;
      DATABASE_NAME: string;
      DATABASE_HOST: string;
      DATABASE_PORT: string;
      JWT_ACCESS_TOKEN: string;
    }
  }
}

export {};
