> **Note:** The full commit history for this project is in the original development repository:
> https://gitlab.lnu.se/1dv027/student/ls224ec/exercises/graphql
> This repository was migrated to the correct location for submission. All code is identical.


# Systembolaget GraphQL API

A GraphQL API serving the Systembolaget (Swedish alcohol retail monopoly) product catalogue. Users can browse 18,572 products, filter by country or product group, and manage products with full CRUD — protected by JWT authentication.

## Implementation Type

GraphQL

## Links and Testing

| | |
|---|---|
| Production API | https://systembolaget-api.onrender.com/graphql |
| GraphQL Playground | https://systembolaget-api.onrender.com/graphql |
| Postman Collection | `SystembolagetAPI.postman_collection.json` |
| Production Environment | `production.postman_environment.json` |

Verify tests via CI/CD pipeline in GitLab, or run manually:

```bash
npx newman run SystembolagetAPI.postman_collection.json -e production.postman_environment.json
```

## Dataset

| Field | Description |
|---|---|
| Dataset source | Systembolaget open data — XLSX export, January 2020 |
| Total records | 18,572 products |
| Primary resource (CRUD) | **Product** — id, name, price, volumeMl, alcoholContent, productGroup, type, style, packaging, origin, originCountry, producer, vintage, organic, kosher |
| Secondary resource 1 (read-only) | **Country** — name, productCount, products |
| Secondary resource 2 (read-only) | **ProductGroup** — name, productCount, products |

## Design Decisions

### Authentication

JWT tokens are issued on `register` and `login` mutations and passed as `Authorization: Bearer <token>` in request headers. The token is verified in Apollo Server's `context` function on every request. Write operations (`addProduct`, `updateProduct`, `deleteProduct`) call a `requireAuth()` helper that throws `AuthenticationError` if no valid token is present.

JWT is stateless — no session storage needed — which works well with CI/CD pipelines where tokens are generated and passed between requests via Postman environment variables. The alternative, session-based auth, requires a shared session store and adds infrastructure complexity with no benefit for an API.

### API Design

All queries and mutations go through the single `/graphql` endpoint. The schema has three main types: `Product`, `Country`, and `ProductGroup`, plus `User` and `AuthPayload` for auth.

Nested queries are implemented on both `Country` and `ProductGroup` — each exposes a `products` field, so the client can fetch a country and its products in one request without a separate endpoint. This is a core advantage of GraphQL over REST.

The `products` query supports `page`, `limit`, `search`, `productGroup`, and `country` arguments. Full-text search uses a MongoDB text index on `name`, `name2`, and `producer`.

### Error Handling

All errors are returned in the standard GraphQL `errors` array. Apollo Server maps:

- `UserInputError` — validation failures, duplicate email, product not found
- `AuthenticationError` — missing or invalid JWT
- Unexpected errors — returned as `INTERNAL_SERVER_ERROR`

Clients always receive HTTP 200 with either a `data` field (success) or `errors` field (failure), which is standard GraphQL behaviour.

## Core Technologies

| Technology | Reason |
|---|---|
| Node.js + Express | Lightweight, good ecosystem |
| Apollo Server v3 | Standard GraphQL server, built-in playground |
| Mongoose | Schema validation and MongoDB ODM |
| MongoDB Atlas | Hosted document store, good fit for product catalogue |
| JWT + bcrypt | Stateless auth, bcrypt for secure password hashing |
| Newman | CLI runner for Postman, integrates with GitLab CI |

## Requirements

### Functional — Common

| Requirement | Issue | Status |
|---|---|---|
| Data acquisition — 18,572 products | #1 | ✅ |
| Full CRUD for primary resource, read-only for secondary | #2 | ✅ |
| JWT authentication for write operations | #3 | ✅ |
| Error handling with consistent format | #4 | ✅ |
| Filtering and pagination | #17 | ✅ |

### Functional — GraphQL

| Requirement | Issue | Status |
|---|---|---|
| Queries and mutations via single `/graphql` endpoint | #14 | ✅ |
| At least one nested query | #15 | ✅ |
| GraphQL Playground available | #16 | ✅ |

### Non-Functional

| Requirement | Issue | Status |
|---|---|---|
| API documentation | #6 | ✅ |
| Automated Postman tests (26 test cases) | #7 | ✅ |
| CI/CD pipeline running tests on every commit | #8 | ✅ |
| Seed script for sample data | #5 | ✅ |
| Code quality — modular, consistent style | #10 | ✅ |
| Deployed and publicly accessible | #9 | ✅ |
| Peer review reflection | #11 | ⬜ |

## Getting Started

```bash
git clone <repo-url>
cd systembolaget-graphql-api
npm install
cp .env.example .env
# fill in MONGO_URI and JWT_SECRET
npm run seed
npm start
```

API available at `http://localhost:5000/graphql`

## Reflection

The trickiest part was Mongoose's `.lean()` stripping the virtual `id` getter, causing GraphQL to throw on the `id` field for nested results. The fix was explicitly mapping `_id` to `id` in nested resolvers.

If doing this again I would use cursor-based pagination instead of offset/limit, which scales better for large datasets.

## Acknowledgements

- Dataset: [Systembolaget open data](https://www.kaggle.com/code/kerneler/starter-liquor-for-days-0acad44c-1/input)
- [Apollo Server docs](https://www.apollographql.com/docs/apollo-server/)
- [Mongoose docs](https://mongoosejs.com/docs/)