import { gql } from "https://deno.land/x/graphql_tag@0.0.1/mod.ts";

export const typeDefs = gql`
  type Query {
    hello: String!
    allUsers: [User!]!
    getUserId(email:String!) : User
  }

  type Mutation {
    insertUser(nickname: String!,email: String!, password: String): User!
    updateUser(id: Int!, nickname: String!,email: String!): User!
    deleteUser(id: Int!): Boolean!
    authUser(username: String!, password: String!): String!
    checkJWT(jwt: String!): Boolean!
  }
  
  type User {
    id: ID!
    role_id: Int!
    nickname: String!
    email: String!
    password: String!
  }

`;