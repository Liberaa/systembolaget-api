require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const { ApolloServer } = require('apollo-server-express')
const cors = require('cors')

const typeDefs = require('./schema/typeDefs')
const resolvers = require('./resolvers')

const app = express()
app.use(cors())
app.use(express.json())

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('MongoDB connected')

    const server = new ApolloServer({
      typeDefs,
      resolvers,
      context: ({ req }) => ({
        token: req.headers.authorization || ''
      })
    })

    await server.start()
    server.applyMiddleware({ app })

    const PORT = process.env.PORT || 5000
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}${server.graphqlPath}`)
    })
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

startServer()