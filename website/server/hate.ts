import miska from "./miska";

import next from "next";
import express, { Request, Response } from "express";

import { ApolloServer, gql } from "apollo-server-express";
import { IResolvers } from "@graphql-tools/utils";

import { graphqlUploadExpress, GraphQLUpload } from "graphql-upload-minimal";

miska.init();

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
    uploadSoundbite: async (_, { file }) => {
      const { createReadStream, filename, mimetype, encoding } = await file;

      const stream = createReadStream();
      miska.createSoundbiteFromStream(filename.split(".")[0], stream);

      return { filename, mimetype, encoding };
    },
  },
};

const apollo = new ApolloServer({
  typeDefs,
  resolvers,
});

app.prepare().then(() => {
  apollo.start().then(async () => {
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
