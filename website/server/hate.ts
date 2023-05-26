import miska from "./miska";

import { json } from "body-parser";
import cors from "cors";

import next from "next";
import express, { Request, Response } from "express";

import { IResolvers } from "@graphql-tools/utils";

import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServer, BaseContext } from "@apollo/server";

miska.init();

const dev = process.env.NODE_ENV !== "production";
const port = 6969;

const nextApp = next({ dev });
const nextHandle = nextApp.getRequestHandler();

const typeDefs = `#graphql
  type Soundbite {
    name: String!
    description: String
    count: Int!
  }

  type Query {
    soundbites: [Soundbite]
  }

  type Mutation {
    joinChannel: Boolean
    leaveChannel: Boolean
    playSoundbite(name: String): Boolean
    deleteSoundbite(name: String): Boolean
  }
`;

const resolvers: IResolvers = {
  Query: {
    soundbites: async () => {
      const soundbites = await miska.getAllSoundbites();

      return soundbites.map((soundbite) => ({
        name: soundbite.name,
        description: soundbite.description,
        count: soundbite.count,
      }));
    },
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
    playSoundbite: async (_, { name }) => {
      miska.playSoundbite(name);
    },
    deleteSoundbite: async (_, { name }) => {
      miska.deleteSoundbite(name);
    },
  },
};

const expressServer = express();

const apollo = new ApolloServer<BaseContext>({
  typeDefs,
  resolvers,
});

const initialize = async () => {
  await nextApp.prepare();

  await apollo.start();

  expressServer.use(
    "/graphql",
    cors<cors.CorsRequest>(),
    json(),
    expressMiddleware(apollo)
  );

  expressServer.get("*", (req: Request, res: Response) => {
    nextHandle(req, res);
  });

  expressServer.listen(port, () => {
    console.log(`Server started on port ${port}`);
    console.log(`Apollo listening on http://localhost:${port}/graphql`);
  });
};

initialize();
