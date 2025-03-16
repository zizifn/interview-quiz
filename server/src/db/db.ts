import { drizzle } from "drizzle-orm/libsql";

const authDB = drizzle({
  connection: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  },
});

export { authDB };
