# Systembolaget GraphQL API

A GraphQL API serving the Systembolaget (Swedish alcohol retail monopoly) product catalogue. Supports full CRUD on products, read-only access to countries and product groups, JWT authentication, and automated testing via Postman/Newman in a CI/CD pipeline.

## Implementation Type

GraphQL

## Links and Testing



Run tests manually (no setup needed):

```bash
npx newman run SystembolagetAPI.postman_collection.json -e production.postman_environment.json
```

## Dataset

| Field | Description |
|---|---|
| Dataset source | Systembolaget open data (XLSX export, January 2020) |
| Total records | 18,572 products |
| Primary resource (CRUD) | **Product** — id, name, price, volumeMl, alcoholContent, productGroup, type, style, packaging, origin, originCountry, producer, vintage, organic, kosher |
| Secondary resource 1 (read-only) | **Country** — name, productCount, products |
| Secondary resource 2 (read-only) | **ProductGroup** — name, productCount, products |

## Design Decisions

### Authentication

JWT tokens are issued on `register` and `login` mutations and must be passed as `Authorization: Bearer <token>` in the request header. The token is verified in the Apollo Server `context` function on every request and made available to resolvers. Write operations (`addProduct`, `updateProduct`, `deleteProduct`) call `requireAuth()` which throws an `AuthenticationError` if no valid token is present.

**Why JWT:** Stateless — no session storage needed, works well with CI/CD test pipelines since tokens can be generated and passed between requests via environment variables. The alternative would be session-based auth, which requires sticky sessions or a shared session store and adds infrastructure complexity for no benefit in an API context.

### API Design

**Schema structure:** Three main types — `Product`, `Country`, `ProductGroup` — plus `User` and `AuthPayload` for auth. Queries and mutations are all served through the single `/graphql` endpoint.

**Nested queries:** `Country` and `ProductGroup` both expose a `products` field, allowing the client to fetch a country or product group and its associated products in a single request. This is one of the main advantages of GraphQL over REST — no need for a separate `/countries/:name/products` endpoint.

**Single endpoint:** All operations go to `POST /graphql`. The operation type (query vs mutation) and shape of the response are determined entirely by the request body. This simplifies routing and makes the API self-documenting via the schema.

**Filtering and pagination:** The `products` query accepts `page`, `limit`, `search`, `productGroup`, and `country` arguments. Full-text search is handled via a MongoDB text index on `name`, `name2`, and `producer`.

### Error Handling

All errors are returned in the standard GraphQL `errors` array with a `message` field. Apollo Server maps error types as follows:

- `UserInputError` — validation failures (missing fields, duplicate email, product not found)
- `AuthenticationError` — missing or invalid JWT token
- Unexpected errors — caught by Apollo and returned as `INTERNAL_SERVER_ERROR`

This means clients always receive a `200` HTTP status with either a `data` field (success) or an `errors` field (failure), which is standard GraphQL behaviour.

## Core Technologies

| Technology | Reason |
|---|---|
| Node.js + Express | Familiar, lightweight, good ecosystem |
| Apollo Server v3 | Industry standard GraphQL server, built-in playground |
| Mongoose | Schema validation and MongoDB ODM |
| MongoDB | Flexible document store, good fit for product catalogue data |
| JWT + bcrypt | Stateless auth, bcrypt for secure password hashing |
| Newman | CLI runner for Postman collections, integrates with GitLab CI |

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Installation

```bash
git clone <repo-url>
cd systembolaget-graphql-api
npm install
cp .env.example .env
# fill in MONGO_URI and JWT_SECRET in .env
```

### Seed the database

Place `Products-2020-jan-07-v1.xlsx` in the project root, then:

```bash
npm run seed
```

### Run

```bash
npm start        # production
npm run dev      # development with nodemon
```

API available at `http://localhost:5000/graphql`

### Run tests

```bash
npm run test:postman
```

## Example Queries

**Get products with pagination:**
```graphql
query {
  products(page: 1, limit: 10, country: "France") {
    total pages
    products { id name price alcoholContent }
  }
}
```

**Get product groups with nested products:**
```graphql
query {
  productGroups {
    name productCount
    products { id name price }
  }
}
```

**Register and login:**
```graphql
mutation {
  register(username: "lukas", email: "lukas@example.com", password: "secret123") {
    token
    user { id email }
  }
}
```

**Add a product (requires Authorization header):**
```graphql
mutation {
  addProduct(name: "Test Wine", price: 149.0, productGroup: "Red wine", originCountry: "Italy", alcoholContent: "13.5%", volumeMl: 750) {
    id name price
  }
}
```

## Reflection

The trickiest part was the `.lean()` issue — Mongoose's `.lean()` strips the virtual `id` getter and returns raw `_id` instead, which GraphQL can't map automatically. The fix was removing `.lean()` from resolvers returning `Product` documents and adding a `Product.id` resolver as a safety net.

Setting up the text index for search required the index to exist in MongoDB before queries run, which the seed script handles automatically via Mongoose schema index definitions.

If I were to do this again I would add cursor-based pagination instead of offset/limit, which scales better for large datasets.

## Acknowledgements

- Dataset: [Systembolaget open data](https://www.systembolaget.se/om-systembolaget/press/oppna-data-och-api/)
- [Apollo Server docs](https://www.apollographql.com/docs/apollo-server/)
- [Mongoose docs](https://mongoosejs.com/docs/)