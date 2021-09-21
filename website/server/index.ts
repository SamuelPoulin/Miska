import "reflect-metadata";

import dotenv from "dotenv";
dotenv.config();

import Miska from "./miska";
import container from "./inversify/inversify.config";
import TYPES from "./inversify/types";

const miska: Miska = container.get<Miska>(TYPES.Miska);
miska.start();

import next from "next";
import express, { Request, Response } from "express";
import { ApolloServer, gql } from "apollo-server-express";

const dev = process.env.NODE_ENV !== "production";
const port = 6969;

const app = next({ dev });
const handle = app.getRequestHandler();

const typeDefs = gql`
  type Query {
    helloWorld: Boolean
  }

  type Mutation {
    joinChannel: Boolean
    leaveChannel: Boolean
  }
`;

const resolvers = {
  Query: {
    helloWorld: async () => true,
  },
  Mutation: {
    joinChannel: async () => {
      miska.joinChannel();

      return true;
    },
    leaveChannel: async () => {
      miska.leaveVoiceChannels();

      return true;
    },
  },
};

const apollo = new ApolloServer({
  typeDefs,
  resolvers,
});

app.prepare().then(() => {
  apollo.start().then(() => {
    const server = express();

    apollo.applyMiddleware({ app: server });

    server.get("*", (req: Request, res: Response) => {
      handle(req, res);
    });

    server.listen(port, () => {
      console.log(`Server started on http://192.168.0.70:${port}`);
      console.log(
        `Apollo listening on http://192.168.0.70:${port}${apollo.graphqlPath}`
      );
    });
  });
});
