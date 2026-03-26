# How to Use the API

Base URL: `https://systembolaget-api.onrender.com/graphql`

All requests are `POST` to the single `/graphql` endpoint with a JSON body containing a `query` or `mutation` string.

---

## Authentication

### Register

```graphql
mutation {
  register(username: "lukas", email: "lukas@example.com", password: "secret123") {
    token
    user { id username email }
  }
}
```

### Login

```graphql
mutation {
  login(email: "lukas@example.com", password: "secret123") {
    token
    user { id username email }
  }
}
```

Copy the `token` from the response. For protected mutations, add it as a header:

```
Authorization: Bearer <your_token>
```

---

## Products

### Get products (with pagination)

```graphql
query {
  products(page: 1, limit: 10) {
    total pages
    products { id name price originCountry productGroup alcoholContent }
  }
}
```

### Filter by country

```graphql
query {
  products(country: "France", limit: 5) {
    total
    products { id name price }
  }
}
```

### Filter by product group

```graphql
query {
  products(productGroup: "Red wine", limit: 5) {
    total
    products { id name price originCountry }
  }
}
```

### Search by name or producer

```graphql
query {
  products(search: "Renat", limit: 5) {
    total
    products { id name price }
  }
}
```

### Get a single product by ID

```graphql
query {
  product(id: "your_product_id_here") {
    id name price volumeMl alcoholContent productGroup originCountry producer vintage organic
  }
}
```

### Add a product (requires auth)

```graphql
mutation {
  addProduct(
    name: "My Wine"
    price: 149.0
    productGroup: "Red wine"
    originCountry: "France"
    alcoholContent: "13.5%"
    volumeMl: 750
    producer: "Some Producer"
  ) {
    id name price
  }
}
```

### Update a product (requires auth)

```graphql
mutation {
  updateProduct(id: "your_product_id_here", price: 199.0, originCountry: "Italy") {
    id name price originCountry
  }
}
```

### Delete a product (requires auth)

```graphql
mutation {
  deleteProduct(id: "your_product_id_here")
}
```

---

## Secondary Resources

### Get all countries with product counts

```graphql
query {
  countries {
    name productCount
  }
}
```

### Get countries with nested products

```graphql
query {
  countries {
    name productCount
    products { id name price alcoholContent }
  }
}
```

### Get all product groups

```graphql
query {
  productGroups {
    name productCount
  }
}
```

### Get product groups with nested products

```graphql
query {
  productGroups {
    name productCount
    products { id name price originCountry }
  }
}
```

---

## Who am I?

```graphql
query {
  me {
    id username email
  }
}
```

Requires `Authorization: Bearer <token>` header.

---

## Error format

All errors come back as HTTP 200 with an `errors` array:

```json
{
  "errors": [
    {
      "message": "Not authenticated",
      "extensions": { "code": "UNAUTHENTICATED" }
    }
  ]
}
```

Common messages:
- `Not authenticated` — missing or invalid token
- `Email or username already taken` — duplicate registration
- `Invalid credentials` — wrong email or password
- `Product not found` — ID does not exist
- `Name is required` — missing required field