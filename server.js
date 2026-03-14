require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const { createServer } = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

connectDB();

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const { optionalAuth } = require('./middleware/auth');
app.use(optionalAuth);

const homeController = require('./controllers/homeController');
app.get('/', homeController.getHome);

app.use('/auth', require('./routes/auth'));
app.use('/products', require('./routes/products'));
app.use('/cart', require('./routes/cart'));
app.use('/orders', require('./routes/orders'));
app.use('/wishlist', require('./routes/wishlist'));
app.use('/messages', require('./routes/messages'));
app.use('/users', require('./routes/users'));
app.use('/admin', require('./routes/admin'));

// Socket.IO for real-time chat
io.on('connection', (socket) => {
  socket.on('join-conversation', (conversationId) => socket.join(conversationId));
  socket.on('send-message', (data) => io.to(data.conversationId).emit('new-message', data));
  socket.on('disconnect', () => {});
});

// 404
app.use((req, res) => res.status(404).render('error', { message: 'Page not found', user: req.user }));

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => console.log(`🛍️  Thrift Store running on http://localhost:${PORT}`));

// Seed initial data
const seedDB = async () => {
  try {
    const Category = require('./models/Category');
    const User = require('./models/User');
    const count = await Category.countDocuments();
    if (count === 0) {
      await Category.insertMany([
        { name: 'T-Shirts', slug: 't-shirts', icon: '👕' },
        { name: 'Shirts', slug: 'shirts', icon: '👔' },
        { name: 'Jeans', slug: 'jeans', icon: '👖' },
        { name: 'Jackets', slug: 'jackets', icon: '🧥' },
        { name: 'Hoodies', slug: 'hoodies', icon: '🤗' },
        { name: 'Shoes', slug: 'shoes', icon: '👟' },
        { name: 'Dresses', slug: 'dresses', icon: '👗' },
        { name: 'Accessories', slug: 'accessories', icon: '👜' }
      ]);
      console.log('Categories seeded');
    }
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      await User.create({ name: 'Admin', email: 'admin@thriftstore.com', password: 'admin123', role: 'admin' });
      console.log('Admin created: admin@thriftstore.com / admin123');
    }
  } catch (e) {}
};
setTimeout(seedDB, 2000);
