const { AuthenticationError, UserInputError } = require('apollo-server-express')
const User = require('../models/User')
const Product = require('../models/Product')
const { generateToken, verifyToken } = require('../utils/auth')

const requireAuth = (token) => {
  const decoded = verifyToken(token)
  if (!decoded) throw new AuthenticationError('Not authenticated')
  return decoded
}

const resolvers = {
  Query: {
    products: async (_, { page = 1, limit = 20, search, productGroup, country }) => {
      const filter = {}
      if (search) filter.$text = { $search: search }
      if (productGroup) filter.productGroup = productGroup
      if (country) filter.originCountry = country

      const skip = (page - 1) * limit
      const [products, total] = await Promise.all([
        Product.find(filter).skip(skip).limit(limit),
        Product.countDocuments(filter)
      ])

      return { products, total, page, pages: Math.ceil(total / limit) }
    },

    product: async (_, { id }) => {
      return Product.findById(id).catch(() => null)
    },

    countries: async () => {
      const result = await Product.aggregate([
        { $match: { originCountry: { $nin: [null, ''] } } },
        { $group: { _id: '$originCountry', productCount: { $sum: 1 } } },
        { $sort: { productCount: -1 } }
      ])
      return result.map(r => ({ name: r._id, productCount: r.productCount }))
    },

    productGroups: async () => {
      const result = await Product.aggregate([
        { $match: { productGroup: { $nin: [null, ''] } } },
        { $group: { _id: '$productGroup', productCount: { $sum: 1 } } },
        { $sort: { productCount: -1 } }
      ])
      return result.map(r => ({ name: r._id, productCount: r.productCount }))
    },

    me: async (_, __, { token }) => {
      const decoded = verifyToken(token)
      if (!decoded) return null
      return User.findById(decoded.id)
    }
  },

  Mutation: {
    register: async (_, { username, email, password }) => {
      if (!username || !email || !password) {
        throw new UserInputError('All fields are required')
      }
      if (password.length < 6) {
        throw new UserInputError('Password must be at least 6 characters')
      }

      const existing = await User.findOne({ $or: [{ email }, { username }] })
      if (existing) throw new UserInputError('Email or username already taken')

      const user = await User.create({ username, email, password })
      return { token: generateToken(user), user }
    },

    login: async (_, { email, password }) => {
      const user = await User.findOne({ email })
      if (!user) throw new UserInputError('Invalid credentials')

      const valid = await user.comparePassword(password)
      if (!valid) throw new UserInputError('Invalid credentials')

      return { token: generateToken(user), user }
    },

    addProduct: async (_, args, { token }) => {
      requireAuth(token)
      if (!args.name) throw new UserInputError('Name is required')
      return Product.create(args)
    },

    updateProduct: async (_, { id, ...updates }, { token }) => {
      requireAuth(token)
      const product = await Product.findByIdAndUpdate(
        id,
        updates,
        { new: true, runValidators: true }
      )
      if (!product) throw new UserInputError('Product not found')
      return product
    },

    deleteProduct: async (_, { id }, { token }) => {
      requireAuth(token)
      const result = await Product.findByIdAndDelete(id)
      if (!result) throw new UserInputError('Product not found')
      return true
    }
  },

  Country: {
    products: ({ name }) => Product.find({ originCountry: name }).limit(10).lean()
  },

  ProductGroup: {
    products: ({ name }) => Product.find({ productGroup: name }).limit(10).lean()
  },

  Product: {
    id: (parent) => parent._id?.toString() || parent.id
  }
}

module.exports = resolvers