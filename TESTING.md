# Testing

Automated tests are written as a Postman collection and run via Newman, both locally and in the GitLab CI/CD pipeline.

## Running Tests

### Locally

```bash
npx newman run SystembolagetAPI.postman_collection.json -e production.postman_environment.json
```

Or via npm:

```bash
npm run test:postman
```

### CI/CD

Tests run automatically on every commit and merge request via `.gitlab-ci.yml`. Check the pipeline output in GitLab for results.

## Environment Setup

Copy `production.postman_environment.json` and fill in your deployed URL:

```json
{
  "key": " ",
  "value": " ",
}
```

All other variables (`token`, `newProductId`, etc.) are set automatically by pre-request scripts during the test run. Do not hardcode them.

## Test Cases

26 test cases across 4 folders.

### Authentication (6 tests)

| # | Name | Type | Expects |
|---|---|---|---|
| 1 | Register - Success | Mutation | Token returned, user created |
| 2 | Register - Duplicate Email | Mutation | Error: "already taken" |
| 3 | Register - Missing Password | Mutation | Error returned |
| 4 | Login - Success | Mutation | Token returned |
| 5 | Login - Wrong Password | Mutation | Error: "Invalid credentials" |
| 6 | Login - Non-existent User | Mutation | Error returned |

### Products - Read (5 tests)

| # | Name | Type | Expects |
|---|---|---|---|
| 7 | Get Products - Success | Query | Array of products, total count |
| 8 | Get Products - Pagination Page 2 | Query | page=2, max 5 results |
| 9 | Get Products - Search Filter | Query | Results array returned |
| 10 | Get Products - Country Filter | Query | All results from France |
| 11 | Get Product - Non-existent ID | Query | null returned |

### Products - Write (7 tests)

| # | Name | Type | Expects |
|---|---|---|---|
| 12 | Add Product - Success | Mutation | Product created with ID |
| 13 | Get Product - By ID | Query | Correct product returned |
| 14 | Add Product - No Auth | Mutation | Error: "Not authenticated" |
| 15 | Add Product - Missing Name | Mutation | Validation error |
| 16 | Update Product - Success | Mutation | Price and country updated |
| 17 | Update Product - No Auth | Mutation | Error: "Not authenticated" |
| 18 | Update Product - Non-existent ID | Mutation | Error: "not found" |

### Secondary Resources (4 tests)

| # | Name | Type | Expects |
|---|---|---|---|
| 19 | Get Countries - Success | Query | Array with name and productCount |
| 20 | Get Product Groups - Success | Query | Array with name and productCount |
| 21 | Get Product Groups - Nested Products | Query | Each group includes products array |
| 22 | Get Countries - Nested Products | Query | Each country includes products array |

### Delete Product (4 tests)

| # | Name | Type | Expects |
|---|---|---|---|
| 23 | Delete Product - No Auth | Mutation | Error: "Not authenticated" |
| 24 | Delete Product - Non-existent ID | Mutation | Error returned |
| 25 | Delete Product - Success | Mutation | Returns true |
| 26 | Get Deleted Product | Query | Returns null |

## Design Decisions

**Random data generation:** Pre-request scripts generate a unique username, email, and product name on every run using `Math.random()`. This ensures tests never conflict with existing database state and can run repeatedly in CI without cleanup.

**Sequence dependency:** The write tests intentionally depend on each other in sequence — register creates a user, login stores the token, addProduct stores the ID, then update/delete use that ID. This mirrors real usage and tests the full workflow end to end.

**Environment variables used:**

| Variable | Set by | Used by |
|---|---|---|
| `token` | Login - Success | All authenticated mutations |
| `newProductId` | Add Product - Success | Get, Update, Delete tests |
| `regEmail` | Register - Success | Login, Duplicate tests |
| `regPassword` | Register - Success | Login test |
| `newProductName` | Pre-request script | Add Product assertion |