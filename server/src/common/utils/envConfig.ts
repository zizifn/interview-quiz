import dotenv from "dotenv";
import { cleanEnv, host, num, port, str, testOnly } from "envalid";

dotenv.config();

export const env = cleanEnv(process.env, {
  NODE_ENV: str({
    devDefault: testOnly("test"),
    choices: ["development", "production", "test"],
  }),
  PORT: port({ devDefault: testOnly(3000) }),
  COUCHBASE_URL: str({
    devDefault: testOnly("test"),
  }),
  COUCHBASE_USER: str({
    devDefault: testOnly("test"),
  }),
  COUCHBASE_PASSWORD: str({
    devDefault: testOnly("test"),
  }),
  TURSO_DATABASE_URL: str({
    devDefault: testOnly("test"),
  }),
  TURSO_AUTH_TOKEN: str({
    devDefault: testOnly("test"),
  }),
});
