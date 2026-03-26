require('dotenv').config()
const mongoose = require('mongoose')
const XLSX = require('xlsx')
const path = require('path')
const Product = require('../models/Product')

async function seed() {
  await mongoose.connect(process.env.MONGO_URI)
  console.log('Connected to MongoDB')

  const filePath = path.join(__dirname, '../Products-2020-jan-07-v1.xlsx')
  const wb = XLSX.readFile(filePath)
  const ws = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json(ws)

  const products = rows.map(row => ({
    articleId: row['Articelid'] || null,
    varNumber: row['Var number'] || null,
    name: row['Name'] || 'Unknown',
    name2: row['Name2'] || null,
    price: parseFloat(row['Price']) || null,
    deposit: parseFloat(row['Deposit']) || null,
    volumeMl: parseFloat(row['VolymInml']) || null,
    pricePerLiter: parseFloat(row['PricePerLiter']) || null,
    salesStart: row['SalesStart'] ? String(row['SalesStart']) : null,
    discontinued: row['Discontinued'] === 1,
    productGroup: row['ProductGroup'] || null,
    type: row['Type'] || null,
    style: row['Style'] || null,
    packaging: row['Packaging'] || null,
    sealType: row['SealType'] || null,
    origin: row['Origin'] || null,
    originCountry: row['OriginCountryName'] || null,
    producer: row['Producer'] || null,
    supplier: row['Supplier'] || null,
    vintage: row['Vintage'] ? parseInt(row['Vintage']) : null,
    alcoholContent: row['AlcoholContent'] || null,
    assortmentCode: row['AssortmentCode'] || null,
    assortmentText: row['AssortmentText'] || null,
    organic: row['Organic'] === 1,
    ethical: row['Ethical'] === 1,
    ethicalLabel: row['EthicalLabel'] || null,
    kosher: row['Kosher'] === 1,
    rawMaterials: row['RawMaterialsDescription'] || null
  }))

  await Product.deleteMany({})
  console.log('Cleared existing products')

  const BATCH_SIZE = 500
  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    await Product.insertMany(products.slice(i, i + BATCH_SIZE))
    console.log(`Seeded ${Math.min(i + BATCH_SIZE, products.length)} / ${products.length}`)
  }

  console.log('Seed complete!')
  await mongoose.disconnect()
}

seed().catch(err => {
  console.error(err)
  process.exit(1)
})