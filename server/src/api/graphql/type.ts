import { pino } from "pino";
type GraphQLContext = {
  user?: {
    id: string;
    name: string;
    email: string;
  };
  session?: {
    id: string;
    userId: string;
  };
  logger?: pino.Logger<never, boolean>;
};

export type { GraphQLContext };
