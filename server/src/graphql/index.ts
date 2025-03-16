import { buildSchema } from "graphql";
import { createHandler } from "graphql-http/lib/use/express";
import { ruruHTML } from "ruru/server";
import express, { Request, Response, Router } from "express";

// Construct a schema, using GraphQL schema language
const schema = buildSchema(`type Query { hello: String } `);

// The root provides a resolver function for each API endpoint
const root = {
  hello() {
    return "Hello world!";
  },
};

const graphqlRouter: Router = express.Router();
graphqlRouter.all(
  "/",
  createHandler({
    schema: schema,
    rootValue: root,
  })
);
graphqlRouter.get("/ui", (_req: Request, res: Response) => {
  res.type("html");
  res.removeHeader("content-security-policy");
  res.end(ruruHTML({ endpoint: "/graphql" }));
});

export { graphqlRouter };
