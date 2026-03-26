const { gql } = require('apollo-server-express')

const typeDefs = gql`
  type Product {
    id: ID!
    articleId: Int
    varNumber: Int
    name: String!
    name2: String
    price: Float
    volumeMl: Float
    pricePerLiter: Float
    salesStart: String
    discontinued: Boolean
    productGroup: String
    type: String
    style: String
    packaging: String
    sealType: String
    origin: String
    originCountry: String
    producer: String
    supplier: String
    vintage: Int
    alcoholContent: String
    assortmentText: String
    organic: Boolean
    ethical: Boolean
    kosher: Boolean
    rawMaterials: String
  }

  type Country {
    name: String!
    productCount: Int!
    products: [Product!]!
  }

  type ProductGroup {
    name: String!
    productCount: Int!
    products: [Product!]!
  }

  type User {
    id: ID!
    username: String!
    email: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type ProductsResult {
    products: [Product!]!
    total: Int!
    page: Int!
    pages: Int!
  }

  type Query {
    products(page: Int, limit: Int, search: String, productGroup: String, country: String): ProductsResult!
    product(id: ID!): Product
    countries: [Country!]!
    productGroups: [ProductGroup!]!
    me: User
  }

  type Mutation {
    register(username: String!, email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    addProduct(
      name: String!
      price: Float
      productGroup: String
      type: String
      originCountry: String
      alcoholContent: String
      volumeMl: Float
      producer: String
    ): Product!
    updateProduct(
      id: ID!
      name: String
      price: Float
      productGroup: String
      type: String
      originCountry: String
      alcoholContent: String
      volumeMl: Float
      producer: String
    ): Product!
    deleteProduct(id: ID!): Boolean!
  }
`

module.exports = typeDefs