# ecom - Modern eCommerce Application

A full-stack eCommerce application built with Next.js 14, Node.js, Express, MySQL, and Better Auth with OAuth support.

## ✨ Features

- 🔐 **Authentication** - Email/password + OAuth (Google, GitHub) via Better Auth
- 🛍️ **Product Catalog** - Browse products with category filtering and price ranges
- 🛒 **Shopping Cart** - Add, update, and remove items
- 💳 **Checkout** - Complete order placement with shipping details
- 📦 **Order Management** - View order history and status
- 👨‍💼 **Admin Dashboard** - Full CRUD operations for products and orders
- 💰 **Ethiopian Birr (ETB)** - Localized currency formatting
- 🎨 **Modern UI** - Glassmorphism effects, responsive design with Tailwind CSS
- 🔔 **Toast Notifications** - Beautiful feedback messages
- ⚡ **Real-time Updates** - Instant cart and order updates

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **React 18**
- **Tailwind CSS**
- **Better Auth Client**

### Backend
- **Node.js** with Express
- **MySQL** with Prisma ORM
- **Better Auth** (Authentication & OAuth)
- **bcryptjs** (Password hashing)

## 📋 Prerequisites

- **Node.js** v18 or higher
- **MySQL** v8 or higher
- **npm** or **yarn**
- (Optional) Google/GitHub OAuth credentials

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd ecom-node
```

### 2. Database Setup

Create MySQL database:

```bash
mysql -u root -p
```

```sql
CREATE DATABASE ecommerce_db;
EXIT;
```

### 3. Backend Setup

```bash
cd backend
```

**Install dependencies:**

```bash
npm install
```

**Configure environment variables:**

```bash
cp .env.example .env
```

Edit `backend/.env` with your credentials:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=ecommerce_db
DATABASE_URL="mysql://root:your_mysql_password@localhost:3306/ecommerce_db"
JWT_SECRET=your_random_secret_min_32_characters
BETTER_AUTH_SECRET=your_random_secret_min_32_characters

# Optional: OAuth Providers
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

**Run Prisma migrations:**

```bash
npx prisma migrate deploy
```

**Seed the database:**

```bash
node prisma/seed.js
```

This creates:
- Admin user: `admin@ecommerce.com` / `admin123456`
- Sample categories and products

**Start backend server:**

```bash
npm run dev
```

Backend runs on **http://localhost:5000**

### 4. Frontend Setup

Open a new terminal:

```bash
cd frontend
```

**Install dependencies:**

```bash
npm install
```

**Start frontend server:**

```bash
npm run dev
```

Frontend runs on **http://localhost:3000**

## 🎯 Usage

### Regular User

1. **Register** - Create account at `/register` or use OAuth
2. **Login** - Sign in at `/login` with email or OAuth
3. **Browse** - View products at `/products`
4. **Shop** - Add items to cart, adjust quantities
5. **Checkout** - Complete purchase at `/checkout`
6. **Orders** - View order history

### Admin User

**Default Admin Credentials:**
- Email: `admin@ecommerce.com`
- Password: `admin123456`

**Admin Features:**
1. Access admin dashboard at `/admin`
2. Add, edit, delete products
3. Manage inventory and pricing
4. View and update order status

## 🔐 OAuth Setup (Optional)

To enable Google/GitHub login, follow the guide in `OAUTH_SETUP.md`.

**Quick steps:**
1. Get OAuth credentials from provider
2. Add to `backend/.env`
3. Restart backend server
4. Social login buttons will work automatically

## 📡 API Endpoints

### Authentication
- `POST /api/auth/sign-up/email` - Register with email
- `POST /api/auth/sign-in/email` - Login with email
- `GET /api/auth/session` - Get current session
- `POST /api/auth/sign-out` - Logout

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (admin)
- `PUT /api/categories/:id` - Update category (admin)
- `DELETE /api/categories/:id` - Delete category (admin)

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:id` - Update quantity
- `DELETE /api/cart/:id` - Remove item
- `DELETE /api/cart` - Clear cart

### Orders
- `GET /api/orders` - Get user's orders
- `GET /api/orders/all` - Get all orders (admin)
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create order
- `PUT /api/orders/:id/status` - Update order status (admin)

## 📁 Project Structure

```
ecom-node/
├── backend/
│   ├── config/
│   │   └── db.js              # MySQL connection
│   ├── lib/
│   │   └── auth.js            # Better Auth config
│   ├── middleware/
│   │   └── better-auth.js     # Auth middleware
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   ├── seed.js            # Database seeder
│   │   └── migrations/        # Migration files
│   ├── routes/
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
│   │   ├── page.js            # Home page
│   │   ├── products/          # Product pages
│   │   ├── cart/              # Cart page
│   │   ├── checkout/          # Checkout page
│   │   ├── admin/             # Admin dashboard
│   │   ├── login/             # Login page
│   │   └── register/          # Register page
│   ├── components/
│   │   ├── Navbar.js
│   │   ├── Footer.js
│   │   ├── ProductCard.js
│   │   ├── Toast.js
│   │   ├── Modal.js
│   │   ├── ConfirmModal.js
│   │   ├── Alert.js
│   │   └── AdminProductForm.js
│   ├── lib/
│   │   ├── auth-client.js     # Better Auth client
│   │   └── currency.js        # ETB formatter
│   ├── next.config.js
│   └── package.json
├── OAUTH_SETUP.md             # OAuth setup guide
└── README.md
```

## 🗄️ Database Schema

### Core Tables
- `user` - User accounts with OAuth support
- `session` - User sessions
- `account` - OAuth accounts (Google, GitHub)
- `verification` - Email verification tokens
- `categories` - Product categories
- `products` - Product catalog
- `cart` - Shopping cart items
- `orders` - Customer orders
- `order_items` - Order line items

## 🔒 Security Features

- ✅ Password hashing with bcryptjs
- ✅ JWT-based authentication
- ✅ OAuth 2.0 integration
- ✅ SQL injection prevention (Prisma ORM)
- ✅ CORS protection
- ✅ Environment variable protection
- ✅ Admin-only routes protection

## 🚧 Production Deployment

1. **Update environment variables:**
   - Change `JWT_SECRET` and `BETTER_AUTH_SECRET`
   - Update `DATABASE_URL` to production database
   - Update OAuth redirect URLs
   - Set `NODE_ENV=production`

2. **Build frontend:**
   ```bash
   cd frontend
   npm run build
   npm start
   ```

3. **Run migrations:**
   ```bash
   cd backend
   npx prisma migrate deploy
   ```

4. **Start backend:**
   ```bash
   npm start
   ```

## 🐛 Troubleshooting

**Database connection error:**
- Check MySQL is running
- Verify credentials in `.env`
- Ensure database exists

**OAuth not working:**
- Check credentials in `.env`
- Verify callback URLs match provider settings
- Restart backend after adding credentials

**Port already in use:**
- Kill process: `lsof -ti:5000 | xargs kill -9`
- Or change PORT in `.env`

## 📝 License

MIT

## 👨‍💻 Author

Built with ❤️ using modern web technologies
