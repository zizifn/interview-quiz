import dotenv from "dotenv";
import { cleanEnv, host, num, port, str, testOnly } from "envalid";

dotenv.config();

export const env = cleanEnv(process.env, {
  NODE_ENV: str({
    devDefault: testOnly("test"),
    choices: ["development", "production", "test"],
  }),
  PORT: port({ devDefault: testOnly(3000) }),
  COUCHBASE_URL: str(),
  COUCHBASE_USER: str(),
  COUCHBASE_PASSWORD: str(),
  TURSO_DATABASE_URL: str(),
  TURSO_AUTH_TOKEN: str(),
});
