# E-Commerce Backend API

A robust Node.js/Express backend for e-commerce applications with JWT authentication, MongoDB storage, and real-time features.

## Features

### Core Functionality

- 🔐 **JWT Authentication** with refresh tokens
- 🛒 **Shopping Cart** with real-time updates
- 📦 **Product Management** (CRUD operations)
- 💳 **Order Processing** system
- 📊 **User Management** with roles

### Technical Highlights

- 🚀 **Express.js** optimized backend
- 🛡️ **Security Middleware** (rate limiting, sanitization)
- 🔄 **Socket.io** for real-time updates
- 📝 **Comprehensive Validation** with express-validator
- 🗃️ **MongoDB** with Mongoose for data modeling

## Installation

### Prerequisites

- Node.js v18+
- MongoDB 6.0+
- Redis (optional for production)

### Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/your-repo/ecommerce-backend.git
   cd ecommerce-backend



   src/
   ├── config/            # DB and environment config
   │   ├── db.js          # Database connection
   │   └── index.js       # Configuration exports
   ├── controllers/       # Route controllers
   │   ├── auth.js        # Authentication logic
   │   ├── cart.js        # Cart operations
   │   └── products.js    # Product management
   ├── middleware/        # Custom middleware
   │   ├── auth.js        # Authentication
   │   ├── error.js       # Error handling
   │   └── validation.js  # Request validation
   ├── models/            # MongoDB models
   │   ├── User.js        # User schema
   │   ├── Product.js     # Product schema
   │   └── Order.js       # Order schema
   ├── routes/            # Route definitions
   │   ├── auth.routes.js # Auth routes
   │   ├── cart.routes.js # Cart routes
   │   └── index.js       # Main router
   ├── utils/             # Utilities
   │   ├── appError.js    # Custom error class
   │   ├── auth.js        # Auth utilities
   │   └── socket.js      # Socket.io setup
   └── server.js          # Main application entry
   ```

# Backend API Routes Documentation

## Table of Contents

- [Authentication](#authentication)
- [Users](#users)
- [Products](#products)
- [Categories](#categories)
- [Cart](#cart)
- [Orders](#orders)
- [Reviews](#reviews)
- [Wishlist](#wishlist)
- [Favorites](#favorites)

---

## Authentication

`/api/v1/auth`

| Endpoint           | Method | Description            | Middleware Stack       |
| ------------------ | ------ | ---------------------- | ---------------------- |
| `/sign-up`         | POST   | Register new user      | Rate Limit, Validation |
| `/`                | POST   | User login             | Rate Limit, Validation |
| `/refresh`         | GET    | Refresh access token   | JWT Verification       |
| `/logout`          | GET    | Logout user            | JWT Verification       |
| `/forgot-password` | POST   | Request password reset | Rate Limit, Validation |
| `/reset-password`  | PATCH  | Reset password         | Validation             |
| `/verify-code`     | POST   | Verify reset code      | Validation             |

---

## Users

`/api/v1/users`

| Endpoint | Method | Description           | Middleware Stack                         |
| -------- | ------ | --------------------- | ---------------------------------------- |
| `/`      | GET    | Get all users (Admin) | JWT, Role Check (Admin)                  |
| `/`      | POST   | Create new user       | Validation                               |
| `/:id`   | PUT    | Update user           | JWT, Role Check, File Upload, Validation |
| `/:id`   | DELETE | Delete user           | JWT, Role Check (Admin), Validation      |

**Nested Routes:**

- `/:userId/favorites` - User favorites
- `/:userId/cart` - User cart
- `/:userId/products` - User products
- `/:userId/reviews` - User reviews

---

## Products

`/api/v1/products`

| Endpoint | Method | Description            | Middleware Stack                               |
| -------- | ------ | ---------------------- | ---------------------------------------------- |
| `/`      | GET    | Get all products       | Filtering                                      |
| `/`      | POST   | Create product (Admin) | JWT, Role Check (Admin), Validation            |
| `/:id`   | GET    | Get single product     | -                                              |
| `/:id`   | PUT    | Update product (Admin) | JWT, Role Check, Multi-file Upload, Validation |
| `/:id`   | DELETE | Delete product (Admin) | JWT, Role Check, Validation                    |

---

## Categories

`/api/v1/categories`

| Endpoint | Method | Description        | Middleware Stack                   |
| -------- | ------ | ------------------ | ---------------------------------- |
| `/`      | GET    | Get all categories | -                                  |
| `/`      | POST   | Create category    | JWT, Role Check (User), Validation |
| `/:id`   | PUT    | Update category    | JWT, Role Check, Validation        |
| `/:id`   | DELETE | Delete category    | JWT, Role Check, Validation        |

**Nested Route:**

- `/:categoryId/subcategory` - Subcategory operations

---

## Cart

`/api/v1/cart`

| Endpoint | Method | Description           | Middleware Stack                         |
| -------- | ------ | --------------------- | ---------------------------------------- |
| `/`      | GET    | Get all carts (Admin) | JWT, Role Check (Admin), Filter          |
| `/`      | POST   | Add to cart           | JWT, Validation                          |
| `/user`  | GET    | Get user cart         | JWT                                      |
| `/:id`   | PATCH  | Remove item from cart | JWT, Role Check (User/Admin), Validation |
| `/:id`   | PUT    | Update cart item      | JWT, Role Check                          |
| `/:id`   | DELETE | Delete cart           | JWT                                      |

---

## Orders

`/api/v1/orders`

| Endpoint            | Method | Description               | Middleware Stack        |
| ------------------- | ------ | ------------------------- | ----------------------- |
| `/`                 | GET    | Get order history         | JWT                     |
| `/`                 | POST   | Create order              | JWT                     |
| `/checkout-session` | POST   | Create Stripe session     | JWT, Role Check (User)  |
| `/stripe-hook`      | POST   | Stripe webhook            | Raw Body Parser         |
| `/shipped`          | GET    | Mark as shipped (Admin)   | JWT, Role Check (Admin) |
| `/delivered`        | GET    | Mark as delivered (Admin) | JWT, Role Check (Admin) |
| `/pending`          | GET    | Mark as pending (Admin)   | JWT, Role Check (Admin) |

---

## Reviews

`/api/v1/reviews`

| Endpoint | Method | Description     | Middleware Stack |
| -------- | ------ | --------------- | ---------------- |
| `/`      | GET    | Get all reviews | Filtering        |
| `/`      | POST   | Create review   | JWT, Validation  |
| `/:id`   | PUT    | Update review   | JWT, Validation  |
| `/`      | DELETE | Delete review   | JWT, Validation  |

---

## Wishlist

`/api/v1/wishlist`

| Endpoint | Method | Description          | Middleware Stack       |
| -------- | ------ | -------------------- | ---------------------- |
| `/`      | GET    | Get wishlist         | JWT, Role Check (User) |
| `/`      | POST   | Add to wishlist      | JWT, Role Check        |
| `/`      | DELETE | Remove from wishlist | JWT, Role Check        |

---

## Favorites

`/api/v1/favorites`

| Endpoint | Method | Description           | Middleware Stack        |
| -------- | ------ | --------------------- | ----------------------- |
| `/`      | GET    | Get favorites (Admin) | JWT, Role Check, Filter |
| `/`      | POST   | Add to favorites      | JWT, Role Check         |
| `/`      | PATCH  | Remove from favorites | JWT, Role Check         |
| `/user`  | GET    | Get user favorites    | JWT                     |
