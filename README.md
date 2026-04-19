# ShopHub — Multi-Vendor E-commerce Platform

A full-stack e-commerce platform built with Spring Boot and React.

## Tech Stack
- **Backend:** Spring Boot 3, Spring Security, JWT, JPA, MySQL
- **Frontend:** React, Vite, Tailwind CSS, Axios

## Features
- JWT Authentication with 3 roles: Customer, Vendor, Admin
- Vendor product management (CRUD)
- Shopping cart and order placement
- Admin panel for vendor approval and category management
- Product image upload (URL or file)

## Project Structure
project/
├── backend/                  ← Spring Boot
│   └── src/main/java/com/ecommerce/backend/
│       ├── config/           (JwtUtil, JwtFilter, SecurityConfig, CorsConfig, AppProperties)
│       ├── controller/       (Auth, Product, Category, Cart, Order, Admin)
│       ├── dto/              (Request/Response objects)
│       ├── entity/           (User, Product, Category, CartItem, Order, OrderItem)
│       ├── repository/       (All JPA repos)
│       ├── service/          (Auth, Product, Category, Cart, Order, Admin)
│       └── exception/        (GlobalExceptionHandler)
│
└── frontend/                 ← React + Vite + Tailwind
    └── src/
        ├── api/              (axios.js)
        ├── components/       (Navbar, ProtectedRoute, Spinner, Toast)
        ├── context/          (AuthContext)
        ├── hooks/            (useToast)
        └── pages/
            ├── Home, Login, Register, NotFound
            ├── customer/     (Cart, Orders)
            ├── vendor/       (VendorDashboard)
            └── admin/        (AdminDashboard)

## Setup Instructions

### Backend
1. Clone the repo
2. Create MySQL database: `CREATE DATABASE ecommerce_db;`
3. Copy `application.properties.example` → `application.properties`
4. Fill in your DB credentials and JWT secret
5. Run: `./mvnw spring-boot:run`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

### Default Admin Account
Insert manually into DB:
```sql
INSERT INTO users (name, email, password, role, approved)
VALUES (
  'Admin',
  'admin@shophub.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhy2',
  'ADMIN',
  true
);
-- Password is: password123
```