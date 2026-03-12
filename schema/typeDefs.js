const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Book {
    id: ID!
    title: String!
    publicationYear: Int
  }

  type Query {
    books: [Book]
  }
`;

module.exports = typeDefs;