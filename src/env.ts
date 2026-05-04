import { validateEnv } from "@constatic/base";
import { z } from "zod";
import "./constants.js";

export const env = await validateEnv(z.looseObject({
    BOT_TOKEN: z.string().min(1, "Discord Bot Token is required"),
    WEBHOOK_LOGS_URL: z.string().url().optional(),
    GUILD_ID: z.string().optional(),
    MYSQL_USER: z.string().optional(),
    MYSQL_PASSWORD: z.string().optional(),
    MYSQL_HOST: z.string().optional(),
    MYSQL_PORT: z.coerce.number().optional(),
    MYSQL_DATABASE: z.string().optional()
}));
