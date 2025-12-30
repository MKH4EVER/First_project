const products = [
  {
    id: 'orbit-max',
    name: 'Orbit Max Headphones',
    price: 329,
    category: 'Audio',
    badge: 'New',
    accent: 'linear-gradient(135deg, #d9e6ff, #f1f4ff)',
    description: 'Spatial audio, adaptive fit, and 42-hour battery with fast charge.',
  },
  {
    id: 'lumen-watch',
    name: 'Lumen Watch',
    price: 399,
    category: 'Wearables',
    badge: 'Series 8',
    accent: 'linear-gradient(135deg, #e4e8ff, #f9fbff)',
    description: 'AMOLED display, health sensors, 7-day battery, and swim proof design.',
  },
  {
    id: 'air-lite',
    name: 'Air Lite Laptop',
    price: 1299,
    category: 'Computers',
    badge: 'Thin',
    accent: 'linear-gradient(135deg, #e8ecef, #f8f9fb)',
    description: 'Silent fanless performance with all-day battery and Liquid Retina display.',
  },
  {
    id: 'neo-phone',
    name: 'Neo Phone',
    price: 999,
    category: 'Phones',
    badge: 'Pro',
    accent: 'linear-gradient(135deg, #d9f3ff, #f4fbff)',
    description: 'Titanium design, ProMotion display, and cinematic camera system.',
  },
  {
    id: 'studio-display',
    name: 'Studio Display',
    price: 1599,
    category: 'Displays',
    accent: 'linear-gradient(135deg, #f1f2f4, #ffffff)',
    description: '5K Retina panel with true tone, low-reflection glass, and studio mics.',
  },
  {
    id: 'cascade-bottle',
    name: 'Cascade Bottle',
    price: 49,
    category: 'Lifestyle',
    badge: 'Limited',
    accent: 'linear-gradient(135deg, #fff2d9, #fff9ed)',
    description: 'Triple-insulated steel with magnetic sip lid and soft matte finish.',
  },
  {
    id: 'vista-bag',
    name: 'Vista Day Bag',
    price: 189,
    category: 'Lifestyle',
    accent: 'linear-gradient(135deg, #e8f7f1, #f7fdf9)',
    description: 'Featherlight build with waterproof coating and padded tech pockets.',
  },
  {
    id: 'stride-sneakers',
    name: 'Stride Knit Sneakers',
    price: 179,
    category: 'Footwear',
    accent: 'linear-gradient(135deg, #f5f5f7, #ffffff)',
    description: 'Adaptive knit upper with responsive cushioning and seamless breathability.',
  },
];

const filters = ['All', ...new Set(products.map((p) => p.category))];
let cart = JSON.parse(localStorage.getItem('cart') || '[]');
let activeFilter = 'All';
const freeShippingThreshold = 500;

const productGrid = document.getElementById('productGrid');
const filterBar = document.getElementById('filterBar');
const cartItems = document.getElementById('cartItems');
const subtotalEl = document.getElementById('subtotal');
const shippingEl = document.getElementById('shipping');
const totalEl = document.getElementById('total');
const cartCount = document.getElementById('cartCount');
const searchInput = document.getElementById('search');
const sortSelect = document.getElementById('sort');
const checkoutForm = document.getElementById('checkoutForm');
const checkoutMessage = document.getElementById('checkoutMessage');
const clearCart = document.getElementById('clearCart');

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

function persistCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function renderFilters() {
  filterBar.innerHTML = filters
    .map(
      (filter) => `
        <button class="filter ${filter === activeFilter ? 'active' : ''}" data-filter="${filter}">
          ${filter}
        </button>
      `
    )
    .join('');
}

function renderProducts() {
  const query = searchInput.value.toLowerCase();
  const sorted = [...products].sort((a, b) => {
    if (sortSelect.value === 'price-asc') return a.price - b.price;
    if (sortSelect.value === 'price-desc') return b.price - a.price;
    if (sortSelect.value === 'new') return b.id.localeCompare(a.id);
    return 0;
  });

  const filtered = sorted.filter((product) => {
    const matchesCategory = activeFilter === 'All' || product.category === activeFilter;
    const matchesQuery = product.name.toLowerCase().includes(query) || product.description.toLowerCase().includes(query);
    return matchesCategory && matchesQuery;
  });

  productGrid.innerHTML = filtered
    .map(
      (product) => `
        <article class="card" style="--accent:${product.accent}">
          <div class="image">
            <div class="pill-row">
              ${product.badge ? `<span class="pill badge">${product.badge}</span>` : ''}
              <span class="pill">${product.category}</span>
            </div>
            <span>${product.name}</span>
          </div>
          <div class="content">
            <h3>${product.name}</h3>
            <p class="meta">${product.description}</p>
            <div class="content-footer">
              <div>
                <p class="price">${formatCurrency(product.price)}</p>
                <p class="meta">In stock • Fast delivery</p>
              </div>
              <button class="btn primary" data-add="${product.id}">Add</button>
            </div>
          </div>
        </article>
      `
    )
    .join('');
}

function addToCart(id) {
  const existing = cart.find((item) => item.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, qty: 1 });
  }
  persistCart();
  renderCart();
}

function updateQty(id, delta) {
  cart = cart
    .map((item) => (item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item))
    .filter((item) => item.qty > 0);
  persistCart();
  renderCart();
}

function removeItem(id) {
  cart = cart.filter((item) => item.id !== id);
  persistCart();
  renderCart();
}

function clearCartItems() {
  cart = [];
  persistCart();
  renderCart();
}

function renderCart() {
  const rows = cart.map((item) => {
    const product = products.find((p) => p.id === item.id);
    const lineTotal = product.price * item.qty;
    return `
      <div class="cart-row">
        <div>
          <div class="pill-row">
            <span class="pill">${product.category}</span>
            ${product.badge ? `<span class="pill badge">${product.badge}</span>` : ''}
          </div>
          <h4>${product.name}</h4>
          <p class="meta">${product.description}</p>
          <p class="price">${formatCurrency(lineTotal)}</p>
        </div>
        <div class="qty">
          <button aria-label="decrease" data-action="dec" data-id="${item.id}">-</button>
          <span>${item.qty}</span>
          <button aria-label="increase" data-action="inc" data-id="${item.id}">+</button>
          <button class="chip" data-action="remove" data-id="${item.id}">Remove</button>
        </div>
      </div>
    `;
  });

  cartItems.innerHTML = rows.join('') || '<p class="meta">Your bag is empty — add something you love.</p>';
  const subtotal = cart.reduce((total, item) => {
    const product = products.find((p) => p.id === item.id);
    return total + product.price * item.qty;
  }, 0);

  const shipping = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 12;
  const total = subtotal + shipping;

  subtotalEl.textContent = formatCurrency(subtotal);
  shippingEl.textContent = shipping ? formatCurrency(shipping) : 'Free';
  totalEl.textContent = formatCurrency(total);
  cartCount.textContent = cart.reduce((sum, item) => sum + item.qty, 0);
}

function handleCheckout(event) {
  event.preventDefault();
  if (!cart.length) {
    checkoutMessage.textContent = 'Add items to your cart before checking out.';
    checkoutMessage.style.borderColor = 'var(--brand)';
    return;
  }

  const formData = new FormData(checkoutForm);
  const name = formData.get('name');
  checkoutMessage.textContent = `Thanks ${name}! Your order is confirmed and a receipt was sent via email.`;
  checkoutMessage.style.borderColor = 'var(--brand)';
  clearCartItems();
  checkoutForm.reset();
}

function attachEvents() {
  filterBar.addEventListener('click', (event) => {
    if (event.target.matches('[data-filter]')) {
      activeFilter = event.target.dataset.filter;
      renderFilters();
      renderProducts();
    }
  });

  productGrid.addEventListener('click', (event) => {
    const addId = event.target.dataset.add;
    if (addId) addToCart(addId);
  });

  cartItems.addEventListener('click', (event) => {
    const id = event.target.dataset.id;
    const action = event.target.dataset.action;
    if (!id || !action) return;
    if (action === 'inc') updateQty(id, 1);
    if (action === 'dec') updateQty(id, -1);
    if (action === 'remove') removeItem(id);
  });

  document.addEventListener('click', (event) => {
    const addId = event.target.dataset.add;
    if (addId) addToCart(addId);
  });

  clearCart.addEventListener('click', clearCartItems);
  sortSelect.addEventListener('change', renderProducts);
  searchInput.addEventListener('input', renderProducts);
  checkoutForm.addEventListener('submit', handleCheckout);
}

renderFilters();
renderProducts();
renderCart();
attachEvents();
