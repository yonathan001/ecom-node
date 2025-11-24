# eCommerce Web Application

A full-stack eCommerce application built with Next.js 14, Node.js, Express, and MySQL.

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- React 18
- Tailwind CSS (CDN)

### Backend
- Node.js
- Express.js
- MySQL2
- JWT Authentication
- bcryptjs

## Features

- User authentication (register/login with JWT)
- Product browsing with category filtering
- Product detail pages
- Shopping cart functionality
- Checkout process
- Order management
- Admin dashboard for product CRUD operations
- Responsive design with Tailwind CSS

## Installation

### Prerequisites
- Node.js (v18 or higher)
- MySQL (v8 or higher)
- npm or yarn

### Database Setup

1. Create MySQL database:
```bash
mysql -u root -p
```

2. Import the schema:
```bash
mysql -u root -p < database/schema.sql
```

Or manually run the SQL commands from `database/schema.sql`

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your database credentials:
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ecommerce_db
JWT_SECRET=your_jwt_secret_key_here_change_in_production
```

5. Start the server:
```bash
npm run dev
```

Backend will run on http://localhost:5000

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```bash
cp .env.local.example .env.local
```

4. Update `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

5. Start the development server:
```bash
npm run dev
```

Frontend will run on http://localhost:3000

## Usage

### Regular User Flow
1. Register a new account at `/register`
2. Login at `/login`
3. Browse products at `/products`
4. View product details by clicking on a product
5. Add products to cart
6. View cart at `/cart`
7. Proceed to checkout at `/checkout`
8. Enter shipping address and place order

### Admin Flow
1. To create an admin user, manually update the database:
```sql
UPDATE users SET is_admin = 1 WHERE email = 'admin@example.com';
```

2. Login with admin account
3. Access admin dashboard at `/admin`
4. Add, edit, or delete products
5. Manage product inventory

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (admin only)
- `PUT /api/categories/:id` - Update category (admin only)
- `DELETE /api/categories/:id` - Delete category (admin only)

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:id` - Update cart item quantity
- `DELETE /api/cart/:id` - Remove item from cart
- `DELETE /api/cart` - Clear cart

### Orders
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create order

## Database Schema

### Tables
- `users` - User accounts
- `categories` - Product categories
- `products` - Product catalog
- `cart` - Shopping cart items
- `orders` - Customer orders
- `order_items` - Order line items

## Testing

1. Start both backend and frontend servers
2. Register a new user account
3. Browse products and add items to cart
4. Complete checkout process
5. Create an admin user in database
6. Test admin dashboard functionality

## Project Structure

```
ecommerce-app/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── categories.js
│   │   ├── cart.js
│   │   └── orders.js
│   ├── .env.example
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── app/
│   │   ├── layout.js
│   │   ├── page.js
│   │   ├── products/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── admin/
│   │   ├── login/
│   │   └── register/
│   ├── components/
│   │   ├── Navbar.js
│   │   ├── ProductCard.js
│   │   ├── Footer.js
│   │   └── AdminProductForm.js
│   ├── .env.local.example
│   ├── next.config.js
│   └── package.json
└── database/
    └── schema.sql
```

## Security Notes

- Change JWT_SECRET in production
- Use HTTPS in production
- Implement rate limiting
- Add input validation
- Use environment variables for sensitive data
- Implement CSRF protection
- Add SQL injection prevention (parameterized queries already implemented)

## Future Enhancements

- Payment gateway integration
- Order status tracking
- Product reviews and ratings
- Wishlist functionality
- Email notifications
- Product search functionality
- Image upload for products
- Pagination for products
- User profile management
- Order history page

## License

MIT
