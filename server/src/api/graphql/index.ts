import { createHandler } from "graphql-http/lib/use/express";
import { ruruHTML } from "ruru/server";
import express, { Request, Response, Router } from "express";
import { buildSchema } from "graphql";
import { restaurantSchema, restaurants } from "./schema/restaurantSchema";
import { queryResolvers } from "./resolvers/queryResolvers";

const graphqlRouter: Router = express.Router();
const graphqlUIRouter: Router = express.Router();

// Combine all schema parts
const typeDefs = `
  type Query {
    # Root level queries should be defined here
    ${restaurants}
  }
  
  ${restaurantSchema}
`;

// Combine all resolver objects
export const rootResolver = {
  ...queryResolvers,
};

const schema = buildSchema(typeDefs);
graphqlRouter.all(
  "/",
  createHandler({
    schema: schema,
    rootValue: rootResolver,
  })
);
graphqlUIRouter.get("/", (_req: Request, res: Response) => {
  res.type("html");
  res.removeHeader("content-security-policy");
  res.end(ruruHTML({ endpoint: "/api/graphql" }));
});

export { graphqlRouter, graphqlUIRouter };
