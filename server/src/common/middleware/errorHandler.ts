import type { ErrorRequestHandler, RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

const unexpectedRequest: RequestHandler = (_req, res) => {
  res.sendStatus(StatusCodes.NOT_FOUND);
};

const addErrorToRequestLog: ErrorRequestHandler = (err, _req, res, next) => {
  res.locals.err = err;
  next(err);
};

const customErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  // If headers already sent, let Express default handler deal with it
  if (res.headersSent) {
    return next(err);
  }

  // Set status code from error or default to 500
  const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;

  req.log.error(err.stack);
  console.log("console.log", err.stack);
  // Format the error response as JSON instead of HTML
  res.status(statusCode).json({
    error: {
      message: err.message || "Internal Server Error",
      ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
    },
  });
};

export default () => [
  unexpectedRequest,
  addErrorToRequestLog,
  customErrorHandler,
];
