import { env } from "@/common/utils/envConfig";
import { app, logger } from "@/server";
import * as fs from "fs";
import * as path from "path";
import * as https from "https";
import * as http from "http";

let server: http.Server | https.Server;

// Check if cert folder exists
const certPath = path.join(__dirname, "../cert");
const hasCertFolder = fs.existsSync(certPath);

if (hasCertFolder) {
  try {
    // Try to load SSL certificates
    const privateKey = fs.readFileSync(path.join(certPath, "key.pem"), "utf8");
    const certificate = fs.readFileSync(
      path.join(certPath, "cert.pem"),
      "utf8"
    );
    const credentials = { key: privateKey, cert: certificate };

    // Create HTTPS server
    server = https.createServer(credentials, app);
    server.listen(env.PORT, () => {
      const { NODE_ENV, PORT } = env;
      logger.info(
        `HTTPS Server (${NODE_ENV}) running on port https://localhost:${PORT}`
      );
    });
  } catch (error) {
    logger.error(`Failed to start HTTPS server: ${error.message}`);
    logger.info("Falling back to HTTP server");
    startHttpServer();
  }
} else {
  startHttpServer();
}

function startHttpServer() {
  server = app.listen(env.PORT, () => {
    const { NODE_ENV, PORT } = env;
    logger.info(
      `HTTP Server (${NODE_ENV}) running on port http://localhost:${PORT}`
    );
  });
}

const onCloseSignal = () => {
  logger.info("sigint received, shutting down");
  server.close(() => {
    logger.info("server closed");
    process.exit();
  });
  setTimeout(() => process.exit(1), 10000).unref(); // Force shutdown after 10s
};

process.on("SIGINT", onCloseSignal);
process.on("SIGTERM", onCloseSignal);
