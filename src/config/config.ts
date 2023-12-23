import dotenv from "dotenv";

dotenv.config();
export const isDev = process.env.NODE_ENV !== "production";

const requiredEnvs = [
    "MONGO_URL",
    "PORT",
    "JWT_SECRET_KEY",
    "EMAIL_PASS",
    "EMAIL_PORT",
    "EMAIL_USER",
    "EMAIL_HOST",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_SECRET_KEY",
    "GOOGLE_CALLBACK_URL",
    "CLIENT_DOMAIN",
] as const;

interface Envs {
    [key: string]: string;
}

const envs: Envs = requiredEnvs.reduce((acc: Envs, key: string) => {
    acc[key] = process.env[key] as string;
    return acc;
}, {});

const missingEnvs: string[] = requiredEnvs.filter((key) => !envs[key]);

if (missingEnvs.length > 0) {
    console.error("ENV Error, the following ENV variables are not set:");
    console.table(missingEnvs);
    console.log(missingEnvs);
    throw new Error("Fix Env and rebuild");
}

export const {
    MONGO_URL,
    PORT,
    JWT_SECRET_KEY,
    EMAIL_PASS,
    EMAIL_PORT,
    EMAIL_USER,
    EMAIL_HOST,
    GOOGLE_CLIENT_ID,
    GOOGLE_SECRET_KEY,
    GOOGLE_CALLBACK_URL,
    CLIENT_DOMAIN,
} = process.env;
