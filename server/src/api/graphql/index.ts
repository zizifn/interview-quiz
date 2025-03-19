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
import { makeExecutableSchema } from "@graphql-tools/schema";
import {
  createReservation,
  getReservations,
  updateReservation,
  updateStatusReservation,
} from "./resolvers/reservationResolvers";
const graphqlRouter: Router = express.Router();
const graphqlUIRouter: Router = express.Router();

// Combine all schema parts
const typeDefs = `
  type Query {
    hello(id: String): Hello
     ${restaurants}
     ${reservationQueries}
  }
  type Hello {
  nested: NestedHello
    message: String
  }
    type NestedHello {
    message: String
    }

  type Mutation {
     ${reservationMutations}
  }
  
  ${restaurantSchema}
  ${reservationSchema}
`;

// Combine all resolver objects
const resolvers = {
  Query: {
    restaurants: getRestaurants,
    reservations: getReservations,
  },
  Mutation: {
    createReservation: createReservation,
    updateReservation: updateReservation,
    updateReservationStatus: updateStatusReservation,
  },
};

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

graphqlRouter.all(
  "/",
  createHandler({
    schema: schema,
    // rootValue: rootResolver, // default rootResolver only have 3 agrs without parent, use makeExecutableSchema merge resolve and schema
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
