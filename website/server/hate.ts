import "reflect-metadata";

import Miska from "./miska";
import container from "./inversify/inversify.config";
import TYPES from "./inversify/types";

const miska: Miska = container.get<Miska>(TYPES.Miska);
miska.start();

import next from "next";
import express, { Request, Response } from "express";

import { ApolloServer, gql } from "apollo-server-express";
import { IResolvers } from "@graphql-tools/utils";
const GraphQLUpload = require("graphql-upload/GraphQLUpload.js");
const graphqlUploadExpress = require("graphql-upload/graphqlUploadExpress.js");

import { finished } from "stream/promises";

const dev = process.env.NODE_ENV !== "production";
const port = 6969;

const app = next({ dev });
const handle = app.getRequestHandler();

const typeDefs = gql`
  scalar Upload

  type File {
    filename: String!
    mimetype: String!
    encoding: String!
  }

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
    uploadSoundbite(file: Upload!): File!
    deleteSoundbite(name: String): Boolean
  }
`;

const resolvers: IResolvers = {
  Upload: GraphQLUpload,
  Query: {
    soundbites: async () => {
      const soundBites = await miska.getSoundBites();

      return soundBites.map((soundbite) => ({
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
    deleteSoundbite: async (_, {name}) => {
      miska.deleteSoundbite(name);
    },
    uploadSoundbite: async (_, { file }) => {
      const { createReadStream, filename, mimetype, encoding } = await file;

      const stream = createReadStream();
      miska.soundbiteService.createSoundbiteFromStream(filename.split('.')[0], stream)

      return { filename, mimetype, encoding };
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

    server.use(graphqlUploadExpress());

    apollo.applyMiddleware({ app: server });

    server.get("*", (req: Request, res: Response) => {
      handle(req, res);
    });

    server.listen(port, () => {
      console.log(`Server started on port ${port}`);
      console.log(`Apollo listening on ${apollo.graphqlPath}`);
    });
  });
});
