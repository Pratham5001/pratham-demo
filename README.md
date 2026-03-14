# 🛍️ ThriftHub - Second-Hand Clothing Marketplace

A complete full-stack web application for buying and selling second-hand clothes.

## 🚀 Quick Start

### Prerequisites
- Node.js v16+
- MongoDB (local or MongoDB Atlas)

### Installation

```bash
# Install dependencies
npm install

# Configure environment
cp .env .env.local
# Edit .env with your MongoDB URI and secrets

# Start the server
npm start
# Or for development with auto-reload:
npm run dev
```

Open http://localhost:3000

**Default Admin:** admin@thriftstore.com / admin123

---

## 🔧 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | HTML, CSS, Bootstrap 5, EJS |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt |
| File Upload | Multer |
| Real-time Chat | Socket.IO |
| Fonts | Playfair Display + DM Sans |

---

## ✨ Features

### 👤 User Auth
- Register / Login / Logout
- JWT token in HTTP-only cookie
- bcrypt password hashing
- Role-based access (user / admin)

### 🛍️ Products
- Add listings with multiple photos (Multer)
- Title, price, description, category, condition, size, brand, tags
- Edit / Delete own listings
- Product detail page with image gallery
- View count tracking

### 📂 Categories
T-Shirts · Shirts · Jeans · Jackets · Hoodies · Shoes · Dresses · Accessories

### 🔍 Search & Filters
- Full-text search
- Filter by category, condition, price range
- Sort by latest, price, rating
- Pagination

### 🛒 Cart
- Add/remove items
- Update quantities
- Persistent cart (MongoDB)
- Real-time cart count in navbar

### ❤️ Wishlist
- Toggle wishlist from any product card
- Wishlist page

### 📦 Orders
- Checkout with shipping address
- Cash on Delivery + Dummy Online Payment
- Order history
- Order detail with tracking status

### ⭐ Reviews
- 1-5 star ratings
- Written reviews
- Average rating on product cards

### 💬 Chat
- Real-time messaging (Socket.IO)
- Buyer ↔ Seller chat
- Message history in MongoDB
- Unread count indicator

### 👑 Admin Panel
- Dashboard with stats (users, products, orders, revenue)
- User management (activate/suspend)
- Product management (delete, feature/unfeature)
- Category management (add/delete)
- Order management (update status)

---

## 📁 Project Structure

```
thrift-store/
├── config/
│   └── db.js              # MongoDB connection
├── controllers/
│   ├── authController.js
│   ├── productController.js
│   ├── cartController.js
│   ├── orderController.js
│   ├── wishlistController.js
│   ├── userController.js
│   ├── messageController.js
│   ├── adminController.js
│   └── homeController.js
├── middleware/
│   ├── auth.js            # JWT protect, adminOnly, optionalAuth
│   └── upload.js          # Multer config
├── models/
│   ├── User.js
│   ├── Product.js
│   ├── Category.js
│   ├── Cart.js
│   ├── Order.js
│   ├── Wishlist.js
│   ├── Review.js
│   └── Message.js
├── routes/
│   ├── auth.js
│   ├── products.js
│   ├── cart.js
│   ├── orders.js
│   ├── wishlist.js
│   ├── users.js
│   ├── messages.js
│   └── admin.js
├── views/
│   ├── partials/          # header, footer, product-card
│   ├── auth/              # login, register
│   ├── products/          # index, detail, add, edit
│   ├── cart/
│   ├── orders/            # checkout, confirmation, index, detail
│   ├── wishlist/
│   ├── user/              # profile, edit-profile, public-profile
│   ├── messages/          # index, chat
│   ├── admin/             # dashboard, users, products, categories, orders
│   ├── home.ejs
│   └── error.ejs
├── public/
│   ├── css/style.css      # Complete custom design system
│   └── js/main.js         # Cart, wishlist, toast functions
├── uploads/               # Product images stored here
├── .env
├── server.js
└── package.json
```

---

## 🎨 Design System

- **Primary:** Deep forest green `#2D5016`
- **Accent:** Warm amber `#E8A838`
- **Background:** Soft cream `#F9F4EE`
- **Typography:** Playfair Display (headings) + DM Sans (body)
- Fully responsive (mobile-first)

---

## 🔐 Environment Variables

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/thrift-store
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
NODE_ENV=development
```
