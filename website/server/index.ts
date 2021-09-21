import next from "next";
import express, { Request, Response } from "express";
import { ApolloServer, gql } from "apollo-server-express";

const dev = process.env.NODE_ENV !== "production";
const port = 3000;

const app = next({ dev });
const handle = app.getRequestHandler();

const typeDefs = gql`
  type Query {
    helloWorld: Boolean
  }
`;

const resolvers = {
  Query: {
    helloWorld: async () => true,
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
      console.log(`Server started on http://localhost:${port}`);
      console.log(
        `Apollo listening on http://localhost:${port}${apollo.graphqlPath}`
      );
    });
  });
});
