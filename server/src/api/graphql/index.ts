import { createHandler } from "graphql-http/lib/use/express";
import { ruruHTML } from "ruru/server";
import express, { Request, Response, Router } from "express";
import { buildSchema } from "graphql";
import { restaurantSchema, restaurants } from "./schema/restaurantSchema";
import {
  reservationSchema,
  reservationQueries,
  reservationMutations,
} from "./schema/reservationSchema";
import { getRestaurants } from "./resolvers/restaurantResolvers";
const graphqlRouter: Router = express.Router();
const graphqlUIRouter: Router = express.Router();

// Combine all schema parts
const typeDefs = `
  type Query {
     ${restaurants}
     ${reservationQueries}
  }

  type Mutation {
     ${reservationMutations}
  }
  
  ${restaurantSchema}
  ${reservationSchema}
`;

// Combine all resolver objects
export const rootResolver = {
  restaurants: getRestaurants,
  // Add reservation resolvers here when implemented
};

const schema = buildSchema(typeDefs);

graphqlRouter.all(
  "/",
  createHandler({
    schema: schema,
    rootValue: rootResolver,
    // resolvers: rootResolver,
    context: (req) => {
      // Access the user and session from the modified request object
      return {
        user: req.raw.locals.user,
        session: req.raw.locals.session,
        logger: req.raw.log,
      };
    },
  })
);

graphqlUIRouter.get("/", (_req: Request, res: Response) => {
  res.type("html");
  res.removeHeader("content-security-policy");
  res.end(ruruHTML({ endpoint: "/api/graphql" }));
});

export { graphqlRouter, graphqlUIRouter };
