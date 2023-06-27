import { serve } from "https://deno.land/std@0.154.0/http/server.ts";
import { GraphQLHTTP } from "https://deno.land/x/gql@1.1.2/mod.ts";
import { makeExecutableSchema } from "https://deno.land/x/graphql_tools@0.0.2/mod.ts";
// import { gql } from "https://deno.land/x/graphql_tag@0.0.1/mod.ts";
import { typeDefs } from "./typedefs.ts";
import { resolvers } from "./resolvers.ts";

const port = 8080; // 指定 port

const handler = async (req: Request) => {
  const { pathname } = new URL(req.url);

  // 指定路徑
  return pathname === '/graphql'
    ? await GraphQLHTTP<Request>({
        schema: makeExecutableSchema({ resolvers, typeDefs }),
        graphiql: true,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "*"
        }
      })(req)
    : new Response('Not Found', { status: 404 });
};

//啟動 GraphQL 伺服器
console.log(`GraphQL HTTP webserver running. Access it at: http://localhost:${port}/graphql`);
await serve(handler, { port });

