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
import requestLogger from "@/common/middleware/requestLogger";
import { env } from "@/common/utils/envConfig";
import { graphqlRouter, graphqlUIRouter } from "@/api/graphql";
import { authRouter } from "./api/auth/authRouter";
import { restaurantRouter } from "./api/restaurant/restaurantRouter";
import { reservationRouter } from "./api/reservation/reservationsRouter";
import { staticMiddleware } from "./common/middleware/staticMiddleware";
import { type } from "os";

const logger = pino({ name: "server start" });
const app: Express = express();

// Set the application to trust the reverse proxy
app.set("trust proxy", true);
app.use(staticMiddleware);

// Middlewares
app.use(cookieParser());
app.use(
  express.json({
    type: "application/json",
  })
);
// no need allow CORS, configure in Vite proxy
// app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(helmet());

// Request logging
app.use(requestLogger);
// Swagger UI no need auth
app.use(openAPIRouter);
app.use("/health-check", healthCheckRouter);
app.use("/graphql", graphqlUIRouter);

app.use(authMiddleware);

// Routes
app.use("/api/graphql", graphqlRouter);
app.use("/api/auth", authRouter);
app.use("/api/restaurants", restaurantRouter);
app.use("/api/reservation", reservationRouter);

// Error handlers
app.use(errorHandler());

export { app, logger };
