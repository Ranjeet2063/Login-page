const products = [
  { id: 1, name: 'Wireless Headphones', category: 'Electronics', price: 120, rating: 4.6, isBestSeller: true, isNew: false, stock: 32, img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&q=80&auto=format&fit=crop', description: 'Noise cancelling Bluetooth headphones.', specs: ['Bluetooth 5.3', '30h battery'] },
  { id: 2, name: 'Running Shoes', category: 'Fashion', price: 95, rating: 4.2, isBestSeller: false, isNew: true, stock: 18, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&q=80&auto=format&fit=crop', description: 'Lightweight shoes for everyday run.', specs: ['Breathable mesh', 'Anti-slip sole'] },
  { id: 3, name: 'Smart Watch', category: 'Electronics', price: 260, rating: 4.8, isBestSeller: true, isNew: true, stock: 24, img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&q=80&auto=format&fit=crop', description: 'Track health and workouts.', specs: ['Heart rate', 'GPS'] },
  { id: 4, name: 'Coffee Maker', category: 'Home', price: 180, rating: 4.1, isBestSeller: false, isNew: false, stock: 11, img: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=700&q=80&auto=format&fit=crop', description: 'Automatic coffee machine.', specs: ['Auto brew', '1.5L tank'] },
  { id: 5, name: 'Backpack', category: 'Fashion', price: 75, rating: 4.4, isBestSeller: true, isNew: false, stock: 50, img: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=700&q=80&auto=format&fit=crop', description: 'Durable all-purpose backpack.', specs: ['Water resistant', 'USB slot'] },
  { id: 6, name: 'Desk Lamp', category: 'Home', price: 45, rating: 3.9, isBestSeller: false, isNew: true, stock: 61, img: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=700&q=80&auto=format&fit=crop', description: 'LED smart desk lamp.', specs: ['Touch dimming', 'Low power'] },
  { id: 7, name: 'Gaming Mouse', category: 'Electronics', price: 80, rating: 4.5, isBestSeller: false, isNew: false, stock: 40, img: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=700&q=80&auto=format&fit=crop', description: 'High precision gaming mouse.', specs: ['12k DPI', 'RGB'] },
  { id: 8, name: 'Yoga Mat', category: 'Fitness', price: 30, rating: 4.3, isBestSeller: true, isNew: false, stock: 74, img: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=700&q=80&auto=format&fit=crop', description: 'Comfortable anti-slip yoga mat.', specs: ['Eco-friendly', '6mm'] },
];

const state = {
  page: 1,
  perPage: 4,
  category: '',
  price: '',
  rating: '',
  sortBy: 'featured',
  search: '',
  cart: JSON.parse(localStorage.getItem('cart') || '[]'),
  wishlist: JSON.parse(localStorage.getItem('wishlist') || '[]'),
  orders: JSON.parse(localStorage.getItem('orders') || '[]'),
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  couponDiscount: 0,
};

const $ = (id) => document.getElementById(id);
const format = (n) => `$${n.toFixed(2)}`;

function saveState() {
  localStorage.setItem('cart', JSON.stringify(state.cart));
  localStorage.setItem('wishlist', JSON.stringify(state.wishlist));
  localStorage.setItem('orders', JSON.stringify(state.orders));
  localStorage.setItem('user', JSON.stringify(state.user));
}

function getFilteredProducts() {
  let list = products.filter((p) =>
    (!state.search || p.name.toLowerCase().includes(state.search.toLowerCase())) &&
    (!state.category || p.category === state.category) &&
    (!state.rating || p.rating >= Number(state.rating)) &&
    (!state.price || (() => {
      const [min, max] = state.price.split('-').map(Number);
      return p.price >= min && p.price <= max;
    })())
  );

  list.sort((a, b) => {
    if (state.sortBy === 'priceAsc') return a.price - b.price;
    if (state.sortBy === 'priceDesc') return b.price - a.price;
    if (state.sortBy === 'rating') return b.rating - a.rating;
    if (state.sortBy === 'newest') return Number(b.isNew) - Number(a.isNew);
    return Number(b.isBestSeller) - Number(a.isBestSeller);
  });

  return list;
}

function productCard(p) {
  const inWishlist = state.wishlist.includes(p.id);
  return `<article class="card">
      <img loading="lazy" src="${p.img}" alt="${p.name}" style="width:100%;height:170px;object-fit:cover;border-radius:.6rem" />
      <h3>${p.name}</h3>
      <p>${p.category} • ${'★'.repeat(Math.floor(p.rating))} ${p.rating}</p>
      <p><strong>${format(p.price)}</strong></p>
      <button class="btn" onclick="addToCart(${p.id})">Add to Cart</button>
      <button class="btn ghost" onclick="viewProduct(${p.id})">View</button>
      <button class="btn ghost" onclick="toggleWishlist(${p.id})">${inWishlist ? '♥ Saved' : '♡ Wishlist'}</button>
    </article>`;
}

function renderCategories() {
  const categoryCounts = [...new Set(products.map((p) => p.category))].map((category) => ({
    category,
    count: products.filter((p) => p.category === category).length,
  }));
  $('categories').innerHTML = categoryCounts.map((c) => `<article class="card"><h3>${c.category}</h3><p>${c.count} products</p><a href="#shop" class="btn ghost" onclick="applyCategory('${c.category}')">Explore</a></article>`).join('');
  $('categoryFilter').innerHTML += categoryCounts.map((c) => `<option value="${c.category}">${c.category}</option>`).join('');
}

function renderProducts() {
  const filtered = getFilteredProducts();
  const start = (state.page - 1) * state.perPage;
  const pageItems = filtered.slice(start, start + state.perPage);
  $('productGrid').innerHTML = pageItems.length ? pageItems.map(productCard).join('') : '<p>No products found.</p>';

  const pages = Math.ceil(filtered.length / state.perPage) || 1;
  $('pagination').innerHTML = Array.from({ length: pages }, (_, i) =>
    `<button class="btn ${i + 1 === state.page ? '' : 'ghost'}" onclick="changePage(${i + 1})">${i + 1}</button>`).join('');
}

function renderCart() {
  $('cartCount').textContent = state.cart.reduce((a, b) => a + b.qty, 0);
  if (!state.cart.length) {
    $('cartItems').innerHTML = '<p>Your cart is empty.</p>';
    $('orderSummary').innerHTML = '';
    return;
  }

  let subtotal = 0;
  $('cartItems').innerHTML = state.cart.map((item) => {
    const p = products.find((x) => x.id === item.id);
    subtotal += p.price * item.qty;
    return `<article class="card"><h4>${p.name}</h4><p>${format(p.price)} × ${item.qty}</p>
      <button class="btn ghost" onclick="updateQty(${item.id}, ${item.qty + 1})">+</button>
      <button class="btn ghost" onclick="updateQty(${item.id}, ${Math.max(1, item.qty - 1)})">-</button>
      <button class="btn ghost" onclick="removeFromCart(${item.id})">Remove</button></article>`;
  }).join('');

  const discount = subtotal * state.couponDiscount;
  const total = subtotal - discount;
  $('orderSummary').innerHTML = `<h3>Order Summary</h3><p>Subtotal: ${format(subtotal)}</p><p>Discount: -${format(discount)}</p><p><strong>Total: ${format(total)}</strong></p>`;
}

function renderWishlist() {
  const list = products.filter((p) => state.wishlist.includes(p.id));
  $('wishlistItems').innerHTML = list.length ? list.map(productCard).join('') : '<p>No wishlist items yet.</p>';
}

function renderDashboard() {
  $('profileInfo').textContent = state.user ? `${state.user.name} (${state.user.email})` : 'Please login to view profile.';
  $('orderHistory').innerHTML = state.orders.length ? state.orders.map((o) => `<li>#${o.id} • ${o.status} • ${format(o.total)}</li>`).join('') : '<li>No orders yet</li>';
  $('savedAddresses').innerHTML = state.user?.addresses?.length ? state.user.addresses.map((a) => `<li>${a}</li>`).join('') : '<li>No saved addresses</li>';
  const sales = state.orders.reduce((sum, o) => sum + o.total, 0);
  $('salesAnalytics').textContent = `Orders: ${state.orders.length} • Revenue: ${format(sales)} • Customers: ${state.user ? 1 : 0}`;
}

function renderAuth(mode = 'login') {
  const forms = {
    login: `<h3>Login</h3><input required name="email" type="email" placeholder="Email" /><input required name="password" type="password" placeholder="Password" minlength="8" /><button class="btn" type="submit">Login</button>`,
    register: `<h3>Register</h3><input required name="name" placeholder="Name" /><input required name="email" type="email" placeholder="Email" /><input required name="password" type="password" minlength="8" placeholder="Password (min 8 chars)" /><button class="btn" type="submit">Register</button>`,
    forgot: `<h3>Forgot Password</h3><input required name="email" type="email" placeholder="Email" /><button class="btn" type="submit">Send Reset Link</button>`,
  };
  $('authForm').dataset.mode = mode;
  $('authForm').innerHTML = forms[mode];
}

function renderProductDetails(id) {
  const p = products.find((x) => x.id === id);
  $('productDetailCard').innerHTML = `<article class="card"><div class="grid-3"><img src="${p.img}" alt="${p.name}" style="width:100%;border-radius:.6rem"/><img src="${p.img}" alt="${p.name}" style="width:100%;border-radius:.6rem"/><img src="${p.img}" alt="${p.name}" style="width:100%;border-radius:.6rem"/></div><h2>${p.name}</h2><p>${p.description}</p><p>Specs: ${p.specs.join(', ')}</p><p>Reviews: ${p.rating} ★</p><button class="btn" onclick="addToCart(${p.id})">Add to Cart</button> <button class="btn" onclick="buyNow(${p.id})">Buy Now</button></article>`;
  $('relatedProducts').innerHTML = products.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4).map(productCard).join('');
}

function addToCart(id) {
  const item = state.cart.find((x) => x.id === id);
  if (item) item.qty += 1;
  else state.cart.push({ id, qty: 1 });
  saveState();
  renderCart();
}
function updateQty(id, qty) { state.cart = state.cart.map((x) => x.id === id ? { ...x, qty } : x); saveState(); renderCart(); }
function removeFromCart(id) { state.cart = state.cart.filter((x) => x.id !== id); saveState(); renderCart(); }
function toggleWishlist(id) { state.wishlist = state.wishlist.includes(id) ? state.wishlist.filter((x) => x !== id) : [...state.wishlist, id]; saveState(); renderWishlist(); renderProducts(); }
function applyCategory(category) { state.category = category; state.page = 1; $('categoryFilter').value = category; renderProducts(); }
function changePage(page) { state.page = page; renderProducts(); }
function viewProduct(id) { renderProductDetails(id); $('productDetails').classList.remove('hidden'); location.hash = '#productDetails'; }
function buyNow(id) { addToCart(id); location.hash = '#checkout'; }

window.addEventListener('DOMContentLoaded', () => {
  $('year').textContent = new Date().getFullYear();
  $('menuBtn').onclick = () => $('nav').classList.toggle('open');
  $('themeBtn').onclick = () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('theme', next);
  };
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) document.documentElement.dataset.theme = savedTheme;

  $('searchInput').oninput = (e) => { state.search = e.target.value.trim(); state.page = 1; renderProducts(); };
  $('categoryFilter').onchange = (e) => { state.category = e.target.value; state.page = 1; renderProducts(); };
  $('priceFilter').onchange = (e) => { state.price = e.target.value; state.page = 1; renderProducts(); };
  $('ratingFilter').onchange = (e) => { state.rating = e.target.value; state.page = 1; renderProducts(); };
  $('sortBy').onchange = (e) => { state.sortBy = e.target.value; renderProducts(); };

  $('applyCoupon').onclick = () => {
    const code = $('couponInput').value.trim().toUpperCase();
    state.couponDiscount = code === 'SAVE10' ? 0.1 : 0;
    renderCart();
  };

  $('checkoutForm').onsubmit = (e) => {
    e.preventDefault();
    if (!state.cart.length) return alert('Your cart is empty.');
    const subtotal = state.cart.reduce((sum, i) => sum + products.find((p) => p.id === i.id).price * i.qty, 0);
    const total = subtotal - subtotal * state.couponDiscount;
    const order = { id: `ORD-${Date.now()}`, total, status: 'Processing' };
    state.orders.unshift(order);
    state.cart = [];
    state.couponDiscount = 0;
    saveState();
    alert(`Order ${order.id} placed successfully!`);
    renderCart();
    renderDashboard();
  };

  $('authForm').onsubmit = (e) => {
    e.preventDefault();
    const mode = $('authForm').dataset.mode;
    const data = Object.fromEntries(new FormData(e.target).entries());
    if (mode === 'register' || mode === 'login') {
      state.user = { name: data.name || 'User', email: data.email, addresses: ['221B Baker Street'] };
      saveState();
      alert(`${mode === 'register' ? 'Registered' : 'Logged in'} successfully`);
      renderDashboard();
    } else {
      alert('Password reset link sent.');
      renderAuth('login');
    }
  };

  document.querySelectorAll('[data-auth]').forEach((btn) => btn.addEventListener('click', () => renderAuth(btn.dataset.auth)));
  $('trackBtn').onclick = () => {
    const orderId = $('trackingInput').value.trim();
    const order = state.orders.find((o) => o.id === orderId);
    $('trackingResult').textContent = order ? `Order ${order.id} is currently: ${order.status}` : 'Order not found.';
  };

  $('contactForm').onsubmit = (e) => { e.preventDefault(); alert('Thanks! We will contact you shortly.'); e.target.reset(); };
  $('newsletterForm').onsubmit = (e) => { e.preventDefault(); alert('Subscribed successfully!'); e.target.reset(); };
  $('backToShop').onclick = () => { $('productDetails').classList.add('hidden'); location.hash = '#shop'; };

  renderCategories();
  renderProducts();
  renderCart();
  renderWishlist();
  renderDashboard();
  renderAuth();
});
