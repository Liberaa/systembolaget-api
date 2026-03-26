const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  articleId: Number,
  varNumber: Number,
  name: { type: String, required: true },
  name2: String,
  price: Number,
  deposit: Number,
  volumeMl: Number,
  pricePerLiter: Number,
  salesStart: String,
  discontinued: { type: Boolean, default: false },
  productGroup: String,
  type: String,
  style: String,
  packaging: String,
  sealType: String,
  origin: String,
  originCountry: String,
  producer: String,
  supplier: String,
  vintage: Number,
  alcoholContent: String,
  assortmentCode: String,
  assortmentText: String,
  organic: { type: Boolean, default: false },
  ethical: { type: Boolean, default: false },
  ethicalLabel: String,
  kosher: { type: Boolean, default: false },
  rawMaterials: String
}, { timestamps: true })

productSchema.index({ name: 'text', name2: 'text', producer: 'text' })
productSchema.index({ productGroup: 1 })
productSchema.index({ originCountry: 1 })

module.exports = mongoose.model('Product', productSchema)