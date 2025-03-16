import cors from "cors";
import express, { type Express } from "express";
import path from "path";
import helmet from "helmet";
import { pino } from "pino";
import cookieParser from "cookie-parser";

import { openAPIRouter } from "@/api-docs/openAPIRouter";
import { healthCheckRouter } from "@/api/healthCheck/healthCheckRouter";
import errorHandler from "@/common/middleware/errorHandler";
import { authMiddleware } from "@/common/middleware/authMiddleware";
import rateLimiter from "@/common/middleware/rateLimiter";
import requestLogger from "@/common/middleware/requestLogger";
import { env } from "@/common/utils/envConfig";
import { graphqlRouter } from "@/graphql";
import { authRouter } from "./api/auth/authRouter";

const logger = pino({ name: "server start" });
const app: Express = express();

// Set the application to trust the reverse proxy
app.set("trust proxy", true);
app.use(express.static(path.join(__dirname, "./public")));

// Middlewares
app.use(cookieParser());
app.use(express.json());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(helmet());
app.use(rateLimiter);

// Request logging
app.use(requestLogger);
app.use(authMiddleware);

// Routes
app.use("/api/graphql", graphqlRouter);
// app.all("/graphql/ui", graphqlUIRouter);

app.use("/health-check", healthCheckRouter);
app.use("/api/auth", authRouter);
// app.use("/users", userRouter);

// Swagger UI
app.use(openAPIRouter);

// Error handlers
app.use(errorHandler());

export { app, logger };
