import express, {
  type Express,
  ErrorRequestHandler,
  NextFunction,
  RequestHandler,
  Request,
  Response,
} from "express";

import path from "path";

const excludedPaths = ["/api"]; // Paths to exclude from static serving

function staticMiddleware(req: Request, res: Response, next: NextFunction) {
  if (excludedPaths.includes(req.path)) {
    next();
  } else {
    express.static(path.join(__dirname, "./public"))(req, res, next);
  }
}

export { staticMiddleware };
