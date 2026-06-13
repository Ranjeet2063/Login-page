const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult, query } = require('express-validator');
const auth = require('../middleware/auth');
const { User, Product, Order, Coupon } = require('../models');

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

router.get('/health', (_, res) => res.json({ status: 'ok' }));

router.post('/auth/register', [body('name').trim().isLength({ min: 2 }), body('email').isEmail().normalizeEmail(), body('password').isLength({ min: 8 })], validate, async (req, res) => {
  const { name, email, password } = req.body;
  if (await User.findOne({ email })) return res.status(409).json({ message: 'Email already in use' });
  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, password: hashedPassword });
  const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

router.post('/auth/login', [body('email').isEmail().normalizeEmail(), body('password').notEmpty()], validate, async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

router.post('/auth/forgot-password', [body('email').isEmail().normalizeEmail()], validate, async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  res.json({ message: user ? 'Password reset email queued' : 'If user exists, reset email is queued' });
});

router.post('/auth/reset-password', [body('email').isEmail().normalizeEmail(), body('newPassword').isLength({ min: 8 })], validate, async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.password = await bcrypt.hash(req.body.newPassword, 12);
  await user.save();
  res.json({ message: 'Password reset successful' });
});

router.get('/products', [query('page').optional().isInt({ min: 1 }), query('limit').optional().isInt({ min: 1, max: 48 }), query('rating').optional().isFloat({ min: 0, max: 5 }), query('sort').optional().isIn(['priceAsc', 'priceDesc', 'rating', 'newest'])], validate, async (req, res) => {
  const { category, search, minPrice, maxPrice, rating, sort = 'newest', page = 1, limit = 12 } = req.query;
  const filter = {
    ...(category ? { category } : {}),
    ...(search ? { title: { $regex: search, $options: 'i' } } : {}),
    ...(rating ? { rating: { $gte: Number(rating) } } : {}),
    ...(minPrice || maxPrice ? { price: { ...(minPrice ? { $gte: Number(minPrice) } : {}), ...(maxPrice ? { $lte: Number(maxPrice) } : {}) } } : {})
  };

  const sortMap = { priceAsc: { price: 1 }, priceDesc: { price: -1 }, rating: { rating: -1 }, newest: { createdAt: -1 } };
  const [items, total] = await Promise.all([
    Product.find(filter).sort(sortMap[sort]).skip((Number(page) - 1) * Number(limit)).limit(Number(limit)),
    Product.countDocuments(filter)
  ]);

  res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) || 1 });
});

router.post('/orders', auth(), [body('items').isArray({ min: 1 }), body('paymentMethod').isIn(['Stripe', 'PayPal', 'Cash On Delivery'])], validate, async (req, res) => {
  const { items, paymentMethod, couponCode } = req.body;
  const productIds = items.map((i) => i.productId);
  const dbProducts = await Product.find({ _id: { $in: productIds } });

  const normalizedItems = items.map((i) => {
    const product = dbProducts.find((p) => p.id === i.productId);
    if (!product) throw new Error('Invalid product');
    if (product.stock < i.quantity) throw new Error(`Insufficient stock for ${product.title}`);
    product.stock -= i.quantity;
    product.save();
    return { product: product.id, quantity: i.quantity, price: product.price };
  });

  let total = normalizedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode, isActive: true });
    if (coupon) total -= total * (coupon.discountPercent / 100);
  }

  const order = await Order.create({ user: req.user.id, items: normalizedItems, total, paymentMethod });
  res.status(201).json(order);
});

router.get('/orders/me', auth(), async (req, res) => {
  const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json(orders);
});

router.get('/orders/:id/tracking', auth(), async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user.id });
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json({ id: order.id, status: order.status, updatedAt: order.updatedAt });
});

router.get('/admin/analytics', auth('admin'), async (_, res) => {
  const [orders, users, products] = await Promise.all([Order.find(), User.countDocuments(), Product.countDocuments()]);
  const revenue = orders.reduce((sum, o) => sum + o.total, 0);
  res.json({ orders: orders.length, users, products, revenue });
});

router.post('/payments/intent', auth(), [body('amount').isFloat({ min: 1 }), body('provider').isIn(['Stripe', 'PayPal'])], validate, (req, res) => {
  res.json({ provider: req.body.provider, clientSecret: `mock_${Date.now()}`, amount: req.body.amount });
});

module.exports = router;
