const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Book {
    bookId: String
    authors: [String]
    description: String
    image: String
    link: String
    title: String
    # user: [User]
  }

  type User {
    _id: ID
    username: String
    email: String
    bookCount: Int
    savedBooks: [Book]
  }
  type Auth {
    token: ID!
    user: User
  }
  type Query {
    me: User
    # findBook(title:String):[Book]
  }

  type Mutation {
    login(email: String!, password: String!): Auth
    addUser(username: String!, email: String!, password: String!): Auth
    saveBook(dataBook: BookInput!): User
    removeBook(bookId: String!): User
  }
  input BookInput {
    bookId: String
    authors: [String]
    description: String
    image: String
    link: String
    title: String
    # user: String
  }
`;

module.exports = typeDefs;

//TODO: * `typeDefs.js`: Define the necessary `Query` and `Mutation` types: