/* ═══════════════════════════════════════════════
   NEXTRONIX v3 — app.js
   Frontend UI and backend API calls
═══════════════════════════════════════════════ */
'use strict';

/* ─── DB ─────────────────────────────────────── */
const DB = {
  get(k)      { try { return JSON.parse(localStorage.getItem('nx3_' + k)); } catch { return null; } },
  set(k, v)   { localStorage.setItem('nx3_' + k, JSON.stringify(v)); },
  del(k)      { localStorage.removeItem('nx3_' + k); }
};

/* ─── Constants ─────────────────────────────── */
// These values stay in the browser because they are UI rules, not database data.
const DELIVERY_FEE    = 7;
const FREE_DELIVERY_AT = 500;

const CATEGORIES_META = [
  { name:'Laptops',     icon:'💻', count:'48 items' },
  { name:'Desktops',    icon:'🖥️', count:'32 items' },
  { name:'Monitors',    icon:'🖵', count:'28 items' },
  { name:'Keyboards',   icon:'⌨️', count:'45 items' },
  { name:'Mouse',       icon:'🖱️', count:'36 items' },
  { name:'Accessories', icon:'🔌', count:'120 items' },
];

/* ─── Seed products ──────────────────────────── */
const SEED_PRODUCTS = [
  { id:'p1',  name:'ProBook X15 Laptop',      category:'Laptops',     price:3799, oldPrice:4299, desc:'A powerful all-round laptop for professionals and students with a stunning IPS display and excellent battery life.', image:'', badge:'new', stock:15,
    specs:{ Brand:'HP', Processor:'Intel Core i7-13th Gen', RAM:'16GB DDR5', Storage:'512GB NVMe SSD', Display:'15.6" Full HD IPS', Battery:'12h', OS:'Windows 11' } },
  { id:'p2',  name:'UltraSlim Pro 13',         category:'Laptops',     price:2899, oldPrice:null, desc:'Ultra-thin and light with exceptional performance. Perfect for on-the-go professionals.', image:'', badge:null, stock:8,
    specs:{ Brand:'Apple', Processor:'Apple M2', RAM:'8GB Unified', Storage:'256GB SSD', Display:'13.3" Retina', Battery:'18h', Wireless:'Wi-Fi 6, BT 5.3' } },
  { id:'p3',  name:'PowerDesk Pro Tower',      category:'Desktops',    price:5299, oldPrice:6199, desc:'Built for gaming, content creation and heavy workloads. No compromises, pure raw performance.', image:'', badge:'sale', stock:4,
    specs:{ Brand:'Custom', Processor:'Intel i9-13900K', RAM:'32GB DDR5', Storage:'1TB NVMe', GPU:'NVIDIA RTX 4070', RGB:'Yes', OS:'Windows 11' } },
  { id:'p4',  name:'MiniDesk Elite',           category:'Desktops',    price:2199, oldPrice:null, desc:'Compact desktop powerhouse. Fits anywhere while delivering impressive everyday performance.', image:'', badge:null, stock:12,
    specs:{ Brand:'Asus', Processor:'AMD Ryzen 7 7700X', RAM:'16GB DDR5', Storage:'512GB NVMe', Wireless:'Wi-Fi 6E, BT 5.2', OS:'Windows 11' } },
  { id:'p5',  name:'CrystalView 27" 4K',       category:'Monitors',    price:1599, oldPrice:1899, desc:'Stunning 4K IPS monitor with HDR600 support. Perfect for design, gaming and media.', image:'', badge:'sale', stock:20,
    specs:{ Brand:'LG', 'Screen Size':'27"', Resolution:'3840×2160 4K', 'Panel Type':'IPS', 'Refresh Rate':'144Hz', HDR:'HDR600', Curved:'No', Ports:'USB-C, HDMI 2.1, DP 1.4' } },
  { id:'p6',  name:'ProDisplay 32" Curved',    category:'Monitors',    price:2299, oldPrice:null, desc:'Immersive 32" curved display for ultra-wide viewing. Great for multitasking and gaming.', image:'', badge:null, stock:7,
    specs:{ Brand:'Samsung', 'Screen Size':'32"', Resolution:'2560×1440 QHD', 'Panel Type':'VA', 'Refresh Rate':'165Hz', Curved:'1800R', FreeSync:'Premium Pro' } },
  { id:'p7',  name:'MechType Pro RGB',         category:'Keyboards',   price:429,  oldPrice:519,  desc:'Full mechanical keyboard with Cherry MX Red switches. Per-key RGB for the ultimate setup.', image:'', badge:'new', stock:30,
    specs:{ Brand:'Keychron', Type:'Mechanical', Switches:'Cherry MX Red', Layout:'TKL', RGB:'Per-key RGB', Wireless:'BT 5.1 + USB-C' } },
  { id:'p8',  name:'TactileBoard Slim 75%',    category:'Keyboards',   price:259,  oldPrice:null, desc:'Low-profile mechanical keyboard in compact 75% layout. Great desk-space saving.', image:'', badge:null, stock:25,
    specs:{ Brand:'Logitech', Type:'Low-Profile Mechanical', Switches:'GL Clicky', Layout:'75%', Wireless:'2.4GHz + BT 5', Battery:'36 months', RGB:'Yes' } },
  { id:'p9',  name:'PrecisionGlide Pro',       category:'Mouse',       price:229,  oldPrice:289,  desc:'High-performance gaming mouse with 25,600 DPI optical sensor and ergonomic right-hand design.', image:'', badge:'sale', stock:18,
    specs:{ Brand:'Razer', Sensor:'25,600 DPI', Buttons:'7 programmable', Wireless:'No (Wired)', RGB:'Chroma RGB', Weight:'95g' } },
  { id:'p10', name:'VerticalEase Wireless',    category:'Mouse',       price:169,  oldPrice:null, desc:'Ergonomic vertical mouse to reduce wrist strain during long sessions. 2-year battery life.', image:'', badge:null, stock:3,
    specs:{ Brand:'Logitech', Type:'Vertical Ergonomic', Sensor:'4,000 DPI', Wireless:'Yes (2.4GHz)', Battery:'2 years', RGB:'No' } },
  { id:'p11', name:'ProPad XXL RGB',           category:'Accessories', price:85,   oldPrice:null, desc:'Extended gaming mouse pad 900×400mm with non-slip rubber base and RGB edge lighting.', image:'', badge:null, stock:50,
    specs:{ Brand:'SteelSeries', Size:'900×400×4mm', Surface:'Micro-woven cloth', RGB:'Edge RGB', 'Water Resistance':'Splash-proof' } },
  { id:'p12', name:'USB-C 11-in-1 Hub',        category:'Accessories', price:199,  oldPrice:259,  desc:'Expand your USB-C port into 11 useful connections. 4K HDMI, 100W PD, USB 3.2, SD, Ethernet.', image:'', badge:'new', stock:22,
    specs:{ Brand:'Anker', Ports:'11-in-1', HDMI:'4K@60Hz', 'Power Delivery':'100W USB-C PD', 'Card Reader':'SD + microSD', Network:'Gigabit Ethernet' } },
  { id:'p13', name:'HyperCool Laptop Stand',   category:'Accessories', price:145,  oldPrice:null, desc:'Adjustable aluminum stand with built-in cooling fan. Keeps your laptop at the perfect angle.', image:'', badge:null, stock:14,
    specs:{ Brand:'Nexstand', Material:'Aluminum', Adjustable:'6 levels', Fan:'Built-in USB', Compatibility:'11"–17" laptops' } },
  { id:'p14', name:'SoundWave Pro Headset',    category:'Accessories', price:379,  oldPrice:459,  desc:'Wireless headset with 7.1 surround sound and active noise cancellation. 50h battery life.', image:'', badge:'sale', stock:9,
    specs:{ Brand:'HyperX', 'Driver Size':'53mm', Wireless:'2.4GHz + BT 5.2', Battery:'50h', Microphone:'Detachable NC', Surround:'7.1 Virtual', RGB:'Yes' } },
];

/* ─── State ──────────────────────────────────── */
let currentUser   = null;
let currentCat    = 'All';
let currentSearch = '';
let toastTimer    = null;
let productCache  = null;
let orderCache    = [];
let userCache     = [];

/* ─── Init ───────────────────────────────────── */
function initDB() {
  // Products, users, and orders now live in MySQL, so old browser copies are removed.
  DB.del('users');
  if (!DB.get('carts'))     DB.set('carts',     {});
  if (!DB.get('wishlists')) DB.set('wishlists', {});
}

document.addEventListener('DOMContentLoaded', async () => {
  initDB();
  // Load products before the first render so product grids use database data.
  await loadProductsFromBackend();
  const saved = DB.get('currentUser');
  if (saved) { currentUser = saved; }
  syncNav();
  renderHomeCats();
  renderAllCats();
  renderFeatured();
  renderCatPills();
  renderProducts();
  updateCartBadge();
  updateWishBadge();
  navigate('home');
});

/* ══════════════════════ HELPERS ══════════════════════ */
function fmt(price) {
  return price.toLocaleString('fr-TN') + ' dt';
}

function esc(str) {
  // User/database text is escaped before entering HTML to avoid broken markup or XSS.
  return String(str ?? '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function imgTag(url, cls) {
  const raw = String(url ?? '').trim();
  if (!raw) return phSVG();

  // Product images are browser paths, not Windows filesystem paths.
  const src = /^https?:\/\//i.test(raw) ? raw : raw.split(/[\\/]/).pop();
  return `<img src="${esc(src)}" class="${cls || ''}" alt="product" onerror="this.outerHTML=phSVG()"/>`;
}

function phSVG() {
  return `<div class="img-ph">
    <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3">
      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
      <path d="m21 15-5-5L5 21"/>
    </svg><span>No Image</span></div>`;
}

function parseSpecs(raw) {
  if (!raw) return {};
  if (typeof raw === 'object' && !Array.isArray(raw)) return raw;
  const out = {};
  // Admin text input is converted into an object so specs are easy to search/render.
  String(raw).split('\n').forEach(line => {
    const i = line.indexOf(':');
    if (i > 0) { const k = line.slice(0,i).trim(); const v = line.slice(i+1).trim(); if (k && v) out[k] = v; }
  });
  return out;
}

function specsToText(specs) {
  if (!specs || typeof specs !== 'object') return '';
  return Object.entries(specs).map(([k,v]) => `${k}: ${v}`).join('\n');
}

function getDeliveryFee(subtotal) {
  return subtotal >= FREE_DELIVERY_AT ? 0 : DELIVERY_FEE;
}

/* ══════════════════════ NAVIGATION ══════════════════════ */
function navigate(page) {
  // Protected pages redirect early so guests cannot see private screens.
  if (['myorders','wishlist'].includes(page) && !currentUser) { navigate('login'); return; }
  if (page === 'admin' && (!currentUser || currentUser.role !== 'admin')) { navigate('adminlogin'); return; }

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

  const pageEl = document.getElementById('page-' + page);
  if (pageEl) pageEl.classList.add('active');
  const navEl = document.getElementById('nav-' + page);
  if (navEl) navEl.classList.add('active');

  if (page === 'home')       { renderFeatured(); document.getElementById('nav-home')?.classList.add('active'); }
  if (page === 'products')   { renderCatPills(); renderProducts(); }
  if (page === 'myorders')   renderMyOrders();
  if (page === 'wishlist')   renderWishlist();
  if (page === 'admin')      renderAdminAll();

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function syncNav() {
  const isClient = currentUser && currentUser.role === 'client';
  const isAdmin  = currentUser && currentUser.role === 'admin';
  const guest    = document.getElementById('guestActions');
  const userDiv  = document.getElementById('userActions');
  const greeting = document.getElementById('userGreeting');

  toggle('nav-myorders', isClient);
  toggle('nav-wishlist',  isClient);
  toggle('nav-admin',     isAdmin);
  // Admin accounts manage the store; client accounts shop.
  toggle('cartBtn',       isClient);

  if (currentUser) {
    guest.classList.add('hidden');
    userDiv.classList.remove('hidden');
    greeting.textContent = '👋 ' + currentUser.name.split(' ')[0];
  } else {
    guest.classList.remove('hidden');
    userDiv.classList.add('hidden');
  }
}

function isAdminUser() {
  return currentUser && currentUser.role === 'admin';
}

function blockAdminShopping() {
  if (!isAdminUser()) return false;
  // This also protects direct calls from old buttons or the browser console.
  showToast('Admin accounts cannot shop.','error');
  return true;
}

function toggle(id, show) {
  const el = document.getElementById(id);
  if (!el) return;
  if (show) el.classList.remove('hidden');
  else el.classList.add('hidden');
}

/* ══════════════════════ AUTH ══════════════════════ */
async function authBackend(payload) {
  try {
    // All auth actions use one endpoint so login/register responses stay consistent.
    const res = await fetch('backend/auth.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    return {
      ok: Boolean(data.ok ?? data.success),
      user: data.user || null,
      message: data.message || '',
      status: res.status
    };
  } catch {
    return { ok: false, user: null, message: 'Authentication service unavailable.' };
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const pass  = document.getElementById('loginPass').value;
  const errEl = document.getElementById('loginError');
  const result = await authBackend({ action:'client_login', email, password:pass });

  if (!result.ok || !result.user) {
    errEl.textContent = '⚠ ' + (result.message || 'Invalid email or password.');
    return;
  }

  loginAs(result.user);
  navigate('home');
}

async function handleAdminLogin(e) {
  e.preventDefault();
  const email = document.getElementById('adminEmail').value.trim();
  const pass  = document.getElementById('adminPass').value;
  const errEl = document.getElementById('adminLoginError');
  const result = await authBackend({ action:'admin_login', email, password:pass });

  if (!result.ok || !result.user) {
    errEl.textContent = '⚠ ' + (result.message || 'Invalid admin credentials.');
    return;
  }

  loginAs(result.user);
  navigate('admin');
}

function loginAs(user) {
  // Only session-safe user data is saved; passwords never belong in localStorage.
  currentUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
  DB.set('currentUser', currentUser);
  syncNav();
  updateCartBadge();
  updateWishBadge();
  showToast('Welcome, ' + user.name.split(' ')[0] + '!', 'success');
  // Clear forms after login so credentials are not left visible.
  ['loginError','adminLoginError'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = ''; });
  ['loginEmail','loginPass','adminEmail','adminPass'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
}

async function handleRegister(e) {
  e.preventDefault();
  const name    = document.getElementById('regName').value.trim();
  const email   = document.getElementById('regEmail').value.trim();
  const pass    = document.getElementById('regPass').value;
  const confirm = document.getElementById('regConfirm').value;
  const errEl   = document.getElementById('regError');
  if (!name || !email || !pass) { errEl.textContent = '⚠ All fields are required.'; return; }
  if (pass.length < 6)          { errEl.textContent = '⚠ Password must be at least 6 characters.'; return; }
  if (pass !== confirm)         { errEl.textContent = '⚠ Passwords do not match.'; return; }
  const result = await authBackend({ action:'register', name, email, password:pass });

  if (!result.ok || !result.user) {
    errEl.textContent = '⚠ ' + (result.message || 'Registration failed.');
    return;
  }

  loginAs(result.user);
  ['regName','regEmail','regPass','regConfirm'].forEach(id => { document.getElementById(id).value = ''; });
  errEl.textContent = '';
  navigate('home');
}

function logout() {
  currentUser = null;
  DB.del('currentUser');
  syncNav();
  updateCartBadge();
  updateWishBadge();
  closeCart(); closeCheckout(); closeQv();
  showToast('Logged out.', 'info');
  navigate('home');
}

/* ══════════════════════ SEARCH ══════════════════════ */
function handleSearch(val) {
  currentSearch = val.trim().toLowerCase();
  toggle('searchClearBtn', !!currentSearch);
  navigate('products');
}
function clearSearch() {
  currentSearch = '';
  document.getElementById('searchInput').value = '';
  toggle('searchClearBtn', false);
  renderProducts();
}
function clearFilters() {
  ['filterMinPrice','filterMaxPrice','filterSpec'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  ['filterInStock','filterLowStock'].forEach(id => { const el = document.getElementById(id); if (el) el.checked = false; });
  renderProducts();
}

/* ══════════════════════ CATEGORIES ══════════════════════ */
function renderHomeCats() {
  const grid = document.getElementById('homeCatsGrid');
  if (!grid) return;
  grid.innerHTML = CATEGORIES_META.map(c =>
    `<div class="cat-card" onclick="filterByCat('${c.name}')">
       <div class="cat-icon">${c.icon}</div>
       <div class="cat-name">${c.name}</div>
       <div class="cat-count">${c.count}</div>
     </div>`).join('');
}

function renderAllCats() {
  const grid = document.getElementById('allCatsGrid');
  if (!grid) return;
  grid.innerHTML = CATEGORIES_META.map(c =>
    `<div class="cat-card" onclick="filterByCat('${c.name}')">
       <div class="cat-icon" style="font-size:2.6rem">${c.icon}</div>
       <div class="cat-name" style="font-size:.95rem">${c.name}</div>
       <div class="cat-count">${c.count}</div>
     </div>`).join('');
}

function filterByCat(name) {
  currentCat = name;
  navigate('products');
}

/* ══════════════════════ PRODUCTS ══════════════════════ */
function normalizeProduct(p) {
  const oldPrice = p.oldPrice ?? p.old_price ?? null;

  // Backend and old frontend names differ, so this keeps the UI code simple.
  return {
    ...p,
    id: String(p.id),
    price: Number(p.price) || 0,
    oldPrice: oldPrice === null || oldPrice === '' ? null : Number(oldPrice),
    desc: p.desc ?? p.description ?? '',
    stock: Number(p.stock) || 0,
    specs: p.specs || {}
  };
}

async function loadProductsFromBackend() {
  try {
    // Products come from MySQL so admin edits are visible to every visitor.
    const res = await fetch('backend/products.php?action=list');
    if (!res.ok) throw new Error('Product request failed.');

    const data = await res.json();
    if (!(data.success || data.ok) || !Array.isArray(data.products)) throw new Error('Invalid product response.');

    productCache = data.products.map(normalizeProduct);
  } catch {
    productCache = [];
  }
}

async function productBackend(payload) {
  try {
    // Admin product changes are sent as actions to one endpoint.
    const res = await fetch('backend/products.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (res.status >= 500) return { ok: false, failed: true, message: data.message || '' };
    return {
      ok: Boolean(data.ok ?? data.success),
      failed: false,
      message: data.message || '',
      data
    };
  } catch {
    return { ok: false, failed: true, message: 'Product service unavailable.' };
  }
}

function getProducts() {
  return productCache || [];
}

function renderFeatured() {
  const grid = document.getElementById('featuredGrid');
  if (!grid) return;
  grid.innerHTML = getProducts().slice(0,8).map(p => cardHTML(p)).join('');
}

function renderCatPills() {
  const el = document.getElementById('catFilter');
  if (!el) return;
  const cats = ['All', ...CATEGORIES_META.map(c => c.name)];
  el.innerHTML = cats.map(c =>
    `<button class="pill${currentCat===c?' active':''}" onclick="setCat('${c}')">${c}</button>`).join('');
}

function setCat(cat) { currentCat = cat; renderCatPills(); renderProducts(); }

function renderProducts() {
  const grid    = document.getElementById('productsGrid');
  const countEl = document.getElementById('resultsCount');
  const noRes   = document.getElementById('noResults');
  if (!grid) return;

  renderCatPills();

  const sort        = document.getElementById('sortSelect')?.value || 'default';
  const minPrice    = parseFloat(document.getElementById('filterMinPrice')?.value) || 0;
  const maxPrice    = parseFloat(document.getElementById('filterMaxPrice')?.value) || Infinity;
  const specSearch  = (document.getElementById('filterSpec')?.value || '').trim().toLowerCase();
  const inStockOnly = document.getElementById('filterInStock')?.checked || false;
  const lowStockOnly= document.getElementById('filterLowStock')?.checked || false;

  let list = getProducts().filter(p => {
    // Filters are applied in the browser for instant feedback after products load.
    if (currentCat !== 'All' && p.category !== currentCat) return false;
    if (currentSearch) {
      const hay = [p.name, p.category, p.desc||'', ...Object.values(p.specs||{}).map(String)].join(' ').toLowerCase();
      if (!hay.includes(currentSearch)) return false;
    }
    if (p.price < minPrice || p.price > maxPrice) return false;
    if (specSearch) {
      const hay2 = [p.name, ...Object.values(p.specs||{}).map(String)].join(' ').toLowerCase();
      if (!hay2.includes(specSearch)) return false;
    }
    if (inStockOnly  && p.stock === 0) return false;
    if (lowStockOnly && !(p.stock > 0 && p.stock <= 5)) return false;
    return true;
  });

  if (sort === 'price-asc')  list.sort((a,b) => a.price - b.price);
  if (sort === 'price-desc') list.sort((a,b) => b.price - a.price);
  if (sort === 'stock-asc')  list.sort((a,b) => a.stock - b.stock);
  if (sort === 'newest')     list.sort((a,b) => (b.id > a.id ? 1 : -1));

  if (list.length === 0) {
    grid.innerHTML = '';
    noRes.classList.remove('hidden');
  } else {
    noRes.classList.add('hidden');
    grid.innerHTML = list.map(p => cardHTML(p)).join('');
  }
  if (countEl) countEl.textContent = list.length + ' product' + (list.length!==1?'s':'') + ' found';
}

/* ─── Stock badges ───────────────────────────── */
function stockBadges(stock) {
  if (stock === 0)  return `<span class="badge badge-out">Out of Stock</span>`;
  if (stock <= 5)   return `<span class="badge badge-low">Low Stock</span>`;
  return '';
}

/* ─── Product card ───────────────────────────── */
function cardHTML(p) {
  const isAdmin = isAdminUser();
  const wl       = getWishlist();
  const wished   = wl.includes(p.id);
  const badgeH   = p.badge ? `<span class="badge badge-${p.badge}">${p.badge.charAt(0).toUpperCase()+p.badge.slice(1)}</span>` : '';
  const stockH   = stockBadges(p.stock);
  const oldH     = p.oldPrice ? `<span class="old-p">${fmt(p.oldPrice)}</span>` : '';
  const disabled = p.stock === 0 ? 'disabled' : '';
  const btnLbl   = p.stock === 0 ? 'Out of Stock' : 'Add to Cart';
  // Admins can inspect products but cannot shop from the storefront.
  const actionsH = isAdmin ? '' : `
        <button class="btn-wish-sm${wished?' wishlisted':''}" onclick="toggleWish('${p.id}')" title="${wished?'Remove from':'Add to'} Wishlist">${wished?'♥':'♡'}</button>
        <button class="btn-add-cart" onclick="addToCart('${p.id}')" ${disabled}>${btnLbl}</button>`;

  return `<div class="product-card">
    <div class="product-img" onclick="openQv('${p.id}')">${imgTag(p.image,'')}</div>
    <div class="product-body">
      <div class="product-top">
        <span class="product-cat">${p.category}</span>
        <div class="badges">${badgeH}${stockH}</div>
      </div>
      <div class="product-name" onclick="openQv('${p.id}')">${esc(p.name)}</div>
      <div class="product-desc">${esc(p.desc||'')}</div>
    </div>
    <div class="product-footer">
      <div class="product-price">${oldH}${fmt(p.price)}</div>
      <div class="product-actions">
        ${actionsH}
      </div>
    </div>
  </div>`;
}

/* ══════════════════════ QUICK VIEW ══════════════════════ */
function openQv(pid) {
  const p = getProducts().find(x => x.id === pid);
  if (!p) return;
  const isAdmin = isAdminUser();
  const wl     = getWishlist();
  const wished = wl.includes(p.id);
  const oldH   = p.oldPrice ? `<span class="op">${fmt(p.oldPrice)}</span>` : '';
  const disabled = p.stock === 0 ? 'disabled' : '';
  const btnLbl   = p.stock === 0 ? 'Out of Stock' : 'Add to Cart';

  let stockH = '';
  if (p.stock === 0)       stockH = `<div class="qv-stock out">Out of Stock</div>`;
  else if (p.stock <= 5)   stockH = `<div class="qv-stock low">⚠ Only ${p.stock} units left!</div>`;
  else                     stockH = `<div class="qv-stock ok">In Stock: <strong>${p.stock}</strong> units</div>`;
  const actionsH = isAdmin ? '' : `
          <button class="btn btn-primary" onclick="addToCart('${p.id}');closeQv()" ${disabled}>${btnLbl}</button>
          <button class="btn-wish${wished?' wishlisted':''}" id="qvWishBtn" onclick="toggleWish('${p.id}');refreshQvWish('${p.id}')">
            ${wished?'♥ In Wishlist':'♡ Add to Wishlist'}
          </button>`;

  const specs = p.specs || {};
  const specsH = Object.keys(specs).length
    ? `<div><div class="qv-specs-title">Specifications</div>
       <div class="qv-specs-grid">
         ${Object.entries(specs).map(([k,v]) => `<div class="qv-spec"><strong>${esc(k)}</strong>${esc(String(v))}</div>`).join('')}
       </div></div>` : '';

  document.getElementById('qvContent').innerHTML = `
    <div class="qv-inner">
      <div class="qv-img-col" style="min-height:300px">${imgTag(p.image,'')}</div>
      <div class="qv-info">
        <div class="qv-cat">${p.category}</div>
        <div class="qv-name">${esc(p.name)}</div>
        <div class="qv-price">${oldH}${fmt(p.price)}</div>
        ${stockH}
        <div class="qv-desc">${esc(p.desc||'')}</div>
        ${specsH}
        <div class="qv-actions">
          ${actionsH}
        </div>
      </div>
    </div>`;

  document.getElementById('qvOverlay').classList.add('open');
}

function refreshQvWish(pid) {
  const wished = getWishlist().includes(pid);
  const btn = document.getElementById('qvWishBtn');
  if (btn) {
    btn.textContent = wished ? '♥ In Wishlist' : '♡ Add to Wishlist';
    if (wished) btn.classList.add('wishlisted'); else btn.classList.remove('wishlisted');
  }
}

function closeQv() { document.getElementById('qvOverlay').classList.remove('open'); }
function closeQvOverlay(e) { if (e.target===document.getElementById('qvOverlay')) closeQv(); }

/* ══════════════════════ WISHLIST ══════════════════════ */
function getWishlist() {
  if (!currentUser) return [];
  const wls = DB.get('wishlists') || {};
  return wls[currentUser.id] || [];
}
function saveWishlist(list) {
  if (!currentUser) return;
  const wls = DB.get('wishlists') || {};
  wls[currentUser.id] = list;
  DB.set('wishlists', wls);
}
function updateWishBadge() {
  const badge = document.getElementById('wishBadge');
  if (!badge) return;
  const n = getWishlist().length;
  badge.textContent = n;
  if (n > 0) badge.classList.remove('hidden'); else badge.classList.add('hidden');
}
function toggleWish(pid) {
  if (!currentUser) { showToast('Login to use wishlist.','error'); navigate('login'); return; }
  if (blockAdminShopping()) return;
  const list = getWishlist();
  const idx  = list.indexOf(pid);
  if (idx >= 0) { list.splice(idx,1); showToast('Removed from wishlist.','info'); }
  else          { list.push(pid);     showToast('Added to wishlist!','success'); }
  saveWishlist(list);
  updateWishBadge();
  renderFeatured();
  renderProducts();
  if (document.getElementById('page-wishlist').classList.contains('active')) renderWishlist();
}
function renderWishlist() {
  const grid  = document.getElementById('wishlistGrid');
  const empty = document.getElementById('wishlistEmpty');
  if (!grid) return;
  const items = getWishlist().map(pid => getProducts().find(p => p.id===pid)).filter(Boolean);
  if (items.length === 0) { grid.innerHTML = ''; empty.classList.remove('hidden'); }
  else { empty.classList.add('hidden'); grid.innerHTML = items.map(p => cardHTML(p)).join(''); }
}

/* ══════════════════════ CART ══════════════════════ */
function getCart()  {
  if (!currentUser) return {};
  const carts = DB.get('carts') || {};
  return carts[currentUser.id] || {};
}
function saveCart(cart) {
  if (!currentUser) return;
  const carts = DB.get('carts') || {};
  carts[currentUser.id] = cart;
  DB.set('carts', carts);
}
function cartItemCount() { return Object.values(getCart()).reduce((a,b)=>a+b,0); }
function cartSubtotal() {
  const products = getProducts();
  // The cart stores ids/quantities; prices are looked up from current products.
  return Object.entries(getCart()).reduce((s,[pid,qty]) => {
    const p = products.find(x=>x.id===pid);
    return s + (p ? p.price*qty : 0);
  }, 0);
}
function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  const n = cartItemCount();
  badge.textContent = n;
  if (n > 0) badge.classList.remove('hidden'); else badge.classList.add('hidden');
}

function addToCart(pid) {
  if (!currentUser) { showToast('Please login to add items.','error'); navigate('login'); return; }
  if (blockAdminShopping()) return;
  const product = getProducts().find(p=>p.id===pid);
  if (!product || product.stock===0) return;
  const cart = getCart();
  const cur  = cart[pid] || 0;
  if (cur >= product.stock) { showToast(`Only ${product.stock} in stock — can't add more.`,'warn'); return; }
  cart[pid] = cur + 1;
  saveCart(cart);
  updateCartBadge();
  renderCartContent();
  showToast(product.name + ' added to cart!','success');
}

function updateQty(pid, delta) {
  const cart    = getCart();
  const product = getProducts().find(p=>p.id===pid);
  const newQty  = (cart[pid]||0) + delta;
  if (newQty <= 0) { delete cart[pid]; }
  else {
    if (product && newQty > product.stock) { showToast(`Only ${product.stock} in stock.`,'warn'); return; }
    cart[pid] = newQty;
  }
  saveCart(cart);
  updateCartBadge();
  renderCartContent();
}

function removeFromCart(pid) {
  const cart = getCart();
  delete cart[pid];
  saveCart(cart);
  updateCartBadge();
  renderCartContent();
}

function openCart() {
  document.getElementById('cartOverlay').classList.add('open');
  renderCartContent();
}
function closeCart() { document.getElementById('cartOverlay').classList.remove('open'); }
function closeCartOverlay(e) { if (e.target===document.getElementById('cartOverlay')) closeCart(); }

function renderCartContent() {
  const container = document.getElementById('cartContent');
  const cart      = getCart();
  const products  = getProducts();
  const items     = Object.entries(cart).map(([pid,qty]) => {
    const p = products.find(x=>x.id===pid); return p ? {...p,qty} : null;
  }).filter(Boolean);

  const title = document.getElementById('cartTitle');
  if (title) title.textContent = `🛒 Cart (${items.length} item${items.length!==1?'s':''})`;

  if (items.length === 0) {
    container.innerHTML = `<div class="cart-empty"><div class="ei">🛒</div><p>Your cart is empty.</p>
      <button class="btn btn-primary" style="margin-top:1rem" onclick="closeCart();navigate('products')">Shop Now</button></div>`;
    return;
  }

  const subtotal = cartSubtotal();
  const delivery = getDeliveryFee(subtotal);
  const total    = subtotal + delivery;

  container.innerHTML = `
    <div class="cart-items-wrap">
      ${items.map(item => `
        <div class="cart-item">
          <div class="cart-item-img">
            ${item.image ? `<img src="${esc(item.image)}" onerror="this.outerHTML='<span class=cart-item-ph>No img</span>'"/>` : '<span class="cart-item-ph">No img</span>'}
          </div>
          <div class="cart-item-info">
            <div class="cart-item-name">${esc(item.name)}</div>
            <div class="cart-item-price">${fmt(item.price * item.qty)}</div>
            <div class="qty-ctrl">
              <button class="qty-btn" onclick="updateQty('${item.id}',-1)">−</button>
              <span class="qty-num">${item.qty}</span>
              <button class="qty-btn" onclick="updateQty('${item.id}',1)">+</button>
              <button class="remove-btn" onclick="removeFromCart('${item.id}')">Remove</button>
            </div>
          </div>
        </div>`).join('')}
    </div>
    <div class="cart-summary-box">
      <div class="summary-row"><span>Subtotal</span><span>${fmt(subtotal)}</span></div>
      <div class="summary-row"><span>Delivery</span><span style="color:${delivery===0?'var(--success)':'var(--text)'}">${delivery===0?'Free':fmt(delivery)}</span></div>
      ${delivery>0?`<div style="font-size:.72rem;color:var(--text3);margin-top:2px">Free delivery on orders ≥ ${fmt(FREE_DELIVERY_AT)}</div>`:''}
      <div class="summary-total"><span>Total</span><span style="color:var(--accent)">${fmt(total)}</span></div>
    </div>
    <div class="cart-cta">
      <button class="btn btn-success btn-full" onclick="openCheckout()">Proceed to Checkout →</button>
    </div>`;
}

/* ══════════════════════ CHECKOUT ══════════════════════ */
function openCheckout() {
  if (!currentUser) { navigate('login'); return; }
  const items = Object.entries(getCart()).map(([pid,qty]) => {
    const p = getProducts().find(x=>x.id===pid); return p ? {...p,qty} : null;
  }).filter(Boolean);
  if (items.length === 0) { showToast('Your cart is empty.','warn'); return; }

  const subtotal = cartSubtotal();
  const delivery = getDeliveryFee(subtotal);
  const total    = subtotal + delivery;

  // Pre-fill name to make checkout faster for the logged-in client.
  document.getElementById('co-name').value = currentUser.name || '';

  // Show the final numbers before sending the order to the backend.
  const wrap = document.getElementById('checkoutSummaryWrap');
  wrap.innerHTML = `<div class="checkout-summary-box">
    ${items.map(i=>`<div class="checkout-row"><span>${esc(i.name)} ×${i.qty}</span><span>${fmt(i.price*i.qty)}</span></div>`).join('')}
    <div class="checkout-row" style="margin-top:.4rem"><span>Subtotal</span><span>${fmt(subtotal)}</span></div>
    <div class="checkout-row"><span>Delivery</span><span>${delivery===0?'Free':fmt(delivery)}</span></div>
    <div class="checkout-total"><span>Total</span><span>${fmt(total)}</span></div>
  </div>`;

  document.getElementById('coError').textContent = '';
  closeCart();
  document.getElementById('checkoutOverlay').classList.add('open');
}
function closeCheckout() { document.getElementById('checkoutOverlay').classList.remove('open'); }
function closeCheckoutOverlay(e) { if (e.target===document.getElementById('checkoutOverlay')) closeCheckout(); }

async function orderBackend(payload) {
  try {
    // Orders stay in MySQL because stock and order history must be shared.
    const res = await fetch('backend/orders.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    return {
      ok: Boolean(data.ok ?? data.success),
      message: data.message || '',
      data
    };
  } catch {
    return { ok: false, message: 'Order service unavailable.', data: null };
  }
}

async function usersBackend(payload) {
  try {
    // Account management is admin-only, so it goes through the backend session.
    const res = await fetch('backend/users.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    return {
      ok: Boolean(data.ok ?? data.success),
      message: data.message || '',
      data
    };
  } catch {
    return { ok: false, message: 'User service unavailable.', data: null };
  }
}

async function confirmOrder(e) {
  e.preventDefault();
  const name    = document.getElementById('co-name').value.trim();
  const phone   = document.getElementById('co-phone').value.trim();
  const address = document.getElementById('co-address').value.trim();
  const city    = document.getElementById('co-city').value.trim();
  const payment = document.getElementById('co-payment').value;
  const errEl   = document.getElementById('coError');

  if (!name||!phone||!address||!city||!payment) { errEl.textContent = '⚠ Please fill in all delivery fields.'; return; }

  const cart     = getCart();
  const products = getProducts();
  const items    = Object.entries(cart).map(([pid,qty]) => {
    const p = products.find(x=>x.id===pid); return p ? {pid,name:p.name,qty,price:p.price,image:p.image} : null;
  }).filter(Boolean);

  if (items.length === 0) { errEl.textContent = '⚠ Your cart is empty.'; return; }

  const subtotal = items.reduce((s,i)=>s+i.price*i.qty,0);
  const delivery = getDeliveryFee(subtotal);
  const total    = subtotal + delivery;

  const result = await orderBackend({
    // The backend creates the order rows and reduces stock in one transaction.
    action: 'checkout',
    user_id: currentUser.id,
    items: items.map(i => ({
      product_id: Number(i.pid),
      quantity: i.qty
    })),
    delivery: {
      fullName: name,
      phone,
      address,
      city
    },
    payment_method: payment
  });

  if (!result.ok) {
    errEl.textContent = '⚠ ' + (result.message || 'Order could not be created.');
    return;
  }

  // Clear the browser cart only after the database order succeeds.
  saveCart({});
  updateCartBadge();
  closeCheckout();
  document.getElementById('checkoutForm').reset();
  await loadProductsFromBackend();
  await loadOrdersFromBackend();
  renderFeatured();
  renderProducts();

  // Build the success view after the backend confirms the order.
  document.getElementById('successMsg').innerHTML =
    `Order confirmed successfully!<br/>
     A confirmation email has been sent to <strong>${esc(currentUser.email)}</strong>.<br/><br/>
     <span style="font-size:.83rem;color:var(--text3)">
       📍 ${esc(address)}, ${esc(city)} &nbsp;·&nbsp; 📞 ${esc(phone)}<br/>
       💳 ${esc(payment)} &nbsp;·&nbsp; Total paid: <strong style="color:var(--accent)">${fmt(total)}</strong>
     </span>`;

  navigate('success');
}

/* ══════════════════════ ORDERS ══════════════════════ */
function normalizeOrder(o) {
  const status = String(o.status || 'pending').toLowerCase();
  const statusMap = {
    pending: 'Pending',
    processing: 'Confirmed',
    shipped: 'Confirmed',
    confirmed: 'Confirmed',
    delivered: 'Delivered',
    cancelled: 'Cancelled'
  };
  const statusLabel = statusMap[status] || 'Pending';

  // Backend order fields are normalized so the old order card UI can be reused.
  return {
    id: o.id,
    userId: o.userId ?? o.user_id ?? currentUser?.id,
    userName: o.userName ?? o.user_name ?? currentUser?.name ?? '',
    userEmail: o.userEmail ?? o.user_email ?? currentUser?.email ?? '',
    delivery: o.delivery || null,
    payment: o.payment ?? o.payment_method ?? '',
    items: (o.items || []).map(i => ({
      pid: String(i.pid ?? i.product_id),
      name: i.name || '',
      qty: Number(i.qty ?? i.quantity) || 0,
      price: Number(i.price ?? i.unit_price) || 0,
      image: i.image || ''
    })),
    subtotal: Number(o.subtotal) || 0,
    deliveryFee: Number(o.deliveryFee ?? o.delivery_fee) || 0,
    total: Number(o.total) || 0,
    date: o.date ?? o.created_at ?? new Date().toISOString(),
    status: statusLabel
  };
}

async function loadOrdersFromBackend() {
  if (!currentUser) return [];
  // Clients only receive their own order history.
  const result = await orderBackend({
    action: 'history',
    user_id: currentUser.id
  });

  if (!result.ok || !Array.isArray(result.data?.orders)) {
    orderCache = [];
    return orderCache;
  }

  orderCache = result.data.orders.map(normalizeOrder);
  return orderCache;
}

async function loadAdminOrdersFromBackend() {
  if (!currentUser || currentUser.role !== 'admin') return [];
  // Admins need all orders for the management dashboard.
  const result = await orderBackend({
    action: 'admin_history',
    user_id: currentUser.id
  });

  if (!result.ok || !Array.isArray(result.data?.orders)) {
    orderCache = [];
    return orderCache;
  }

  orderCache = result.data.orders.map(normalizeOrder);
  return orderCache;
}

function statusClass(s) {
  return { Pending:'s-Pending', Confirmed:'s-Confirmed', Delivered:'s-Delivered', Cancelled:'s-Cancelled' }[s] || 's-Pending';
}

function orderCardHTML(order, showUser=true, canChangeStatus=false) {
  const statuses = ['Pending','Confirmed','Delivered','Cancelled'];
  const selHTML  = canChangeStatus
    ? `<select class="form-input admin-status-sel" onchange="updateOrderStatus('${order.id}',this.value)">
         ${statuses.map(s=>`<option${order.status===s?' selected':''}>${s}</option>`).join('')}
       </select>` : '';
  const delivH = order.delivery
    ? `<div class="order-meta">
         <span>📍 ${esc(order.delivery.address)}, ${esc(order.delivery.city)}</span>
         <span>📞 ${esc(order.delivery.phone)}</span>
         <span>💳 ${esc(order.payment||'')}</span>
         ${showUser ? `<span>✉️ ${esc(order.userEmail)}</span>` : ''}
       </div>` : '';

  const sub  = order.subtotal   ?? order.total;
  const fee  = order.deliveryFee ?? 0;
  const tot  = order.total;

  return `<div class="order-card">
    <div class="order-head">
      <div>
        <div class="order-id">${esc(order.id)}</div>
        <div class="order-date">${new Date(order.date).toLocaleString('fr-TN')}</div>
        ${showUser ? `<div style="font-size:.78rem;color:var(--text3);margin-top:1px">👤 ${esc(order.userName)}</div>` : ''}
      </div>
      <div class="order-head-right">
        <span class="status-badge ${statusClass(order.status)}">${order.status}</span>
        ${selHTML}
      </div>
    </div>
    ${delivH}
    <div class="order-items">
      ${order.items.map(i=>`<span class="order-item-tag">${esc(i.name)} ×${i.qty}</span>`).join('')}
    </div>
    <div class="order-totals-detail">
      Subtotal: ${fmt(sub)} &nbsp;+&nbsp; Delivery: ${fee===0?'Free':fmt(fee)}
    </div>
    <div class="order-footer">
      <span style="font-size:.78rem;color:var(--text3)">${order.items.length} item type${order.items.length!==1?'s':''}</span>
      <span class="order-total-val">${fmt(tot)}</span>
    </div>
  </div>`;
}

async function renderMyOrders() {
  const el = document.getElementById('myOrdersList');
  if (!el || !currentUser) return;
  el.innerHTML = '<p style="color:var(--text3)">Loading orders...</p>';
  const orders = (await loadOrdersFromBackend()).sort((a,b)=>new Date(b.date)-new Date(a.date));
  el.innerHTML = orders.length === 0
    ? `<div class="empty-orders"><div style="font-size:2.8rem;margin-bottom:.8rem">📦</div><p>No orders yet.</p>
       <button class="btn btn-primary" style="margin-top:.75rem" onclick="navigate('products')">Browse Products</button></div>`
    : orders.map(o=>orderCardHTML(o,false,false)).join('');
}

/* ══════════════════════ ADMIN ══════════════════════ */
let activeAdminTab = 'dashboard';

function adminTab(tab) {
  activeAdminTab = tab;
  document.querySelectorAll('.admin-tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.admin-nav-link').forEach(l=>l.classList.remove('active'));
  const tabEl = document.getElementById('tab-'+tab);
  const navEl = document.getElementById('atab-'+tab);
  if (tabEl) tabEl.classList.add('active');
  if (navEl) navEl.classList.add('active');
  if (tab==='dashboard')  renderAdminDashboard();
  if (tab==='orders')     renderAdminOrders();
  if (tab==='products')   renderAdminProducts();
  if (tab==='accounts')   renderAdminAccounts();
}

function renderAdminAll() { adminTab(activeAdminTab); }

async function renderAdminDashboard() {
  const orders   = await loadAdminOrdersFromBackend();
  const products = getProducts();
  const users    = currentUser ? [currentUser] : [];
  const revenue  = orders.reduce((s,o)=>s+o.total,0);
  const pending  = orders.filter(o=>o.status==='Pending').length;
  const clients  = users.filter(u=>u.role==='client').length;
  const lowStock = products.filter(p=>p.stock>0&&p.stock<=5).length;
  const outStock = products.filter(p=>p.stock===0).length;

  const statsEl = document.getElementById('adminStats');
  if (statsEl) statsEl.innerHTML = `
    <div class="stat-card"><div class="sc-label">Revenue</div><div class="sc-value c-accent">${fmt(revenue)}</div></div>
    <div class="stat-card"><div class="sc-label">Orders</div><div class="sc-value c-text">${orders.length}</div></div>
    <div class="stat-card"><div class="sc-label">Pending</div><div class="sc-value c-warn">${pending}</div></div>
    <div class="stat-card"><div class="sc-label">Products</div><div class="sc-value c-success">${products.length}</div></div>
    <div class="stat-card"><div class="sc-label">Clients</div><div class="sc-value c-text">${clients}</div></div>
    <div class="stat-card"><div class="sc-label">Low Stock</div><div class="sc-value c-danger">${lowStock}</div></div>
    <div class="stat-card"><div class="sc-label">Out of Stock</div><div class="sc-value c-danger">${outStock}</div></div>`;

  const recentEl = document.getElementById('dashRecentOrders');
  if (recentEl) {
    const recent = [...orders].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,5);
    recentEl.innerHTML = recent.length ? recent.map(o=>orderCardHTML(o,true,false)).join('') : '<p style="color:var(--text3)">No orders yet.</p>';
  }
}

async function renderAdminOrders() {
  const el = document.getElementById('adminOrdersList');
  if (!el) return;
  el.innerHTML = '<p style="color:var(--text3)">Loading orders...</p>';
  const orders = [...(await loadAdminOrdersFromBackend())].sort((a,b)=>new Date(b.date)-new Date(a.date));
  el.innerHTML = orders.length ? orders.map(o=>orderCardHTML(o,true,true)).join('') : '<p style="color:var(--text3)">No orders yet.</p>';
}

async function updateOrderStatus(orderId, status) {
  // The UI says Confirmed, while the database enum stores it as processing.
  const statusValue = status === 'Confirmed' ? 'processing' : String(status).toLowerCase();
  const result = await orderBackend({
    action: 'update_status',
    order_id: orderId,
    status: statusValue
  });
  if (!result.ok) { showToast(result.message || 'Could not update status.','error'); return; }
  showToast('Status updated to '+status,'success');
  if (activeAdminTab==='orders')    renderAdminOrders();
  if (activeAdminTab==='dashboard') renderAdminDashboard();
}

function renderAdminProducts() {
  const tbody = document.getElementById('productsTableBody');
  if (!tbody) return;
  tbody.innerHTML = getProducts().map(p => `
    <tr id="prow-${p.id}">
      <td><div class="td-thumb">${p.image?`<img src="${esc(p.image)}" onerror="this.outerHTML='<span class=td-ph>?</span>'"/>`:'<span class="td-ph">?</span>'}</div></td>
      <td><span class="td-name">${esc(p.name)}</span></td>
      <td><span class="badge badge-new" style="font-size:.68rem">${p.category}</span></td>
      <td style="font-weight:600;color:var(--accent);white-space:nowrap">${fmt(p.price)}</td>
      <td style="color:${p.stock===0?'var(--danger)':p.stock<=5?'var(--warn)':'var(--text2)'}">${p.stock}${p.stock===0?' ✕':p.stock<=5?' ⚠':''}</td>
      <td><div class="td-actions">
        <button class="btn btn-outline btn-sm" onclick="editProduct('${p.id}')">Edit</button>
        <button class="btn btn-danger" onclick="deleteProduct('${p.id}')">Delete</button>
      </div></td>
    </tr>`).join('');
}

function editProduct(pid) {
  const p = getProducts().find(x=>x.id===pid);
  if (!p) return;
  const catOpts = ['Laptops','Desktops','Monitors','Keyboards','Mouse','Accessories']
    .map(c=>`<option${c===p.category?' selected':''}>${c}</option>`).join('');
  const badgeOpts = [['','None'],['new','New'],['sale','Sale']]
    .map(([v,l])=>`<option value="${v}"${(p.badge||'')===(v)?' selected':''}>${l}</option>`).join('');
  const specsStr = specsToText(p.specs||{});

  const row    = document.getElementById('prow-'+pid);
  const oldEdit = document.getElementById('pedit-'+pid);
  if (oldEdit) { cancelEdit(pid); return; }

  const editRow = document.createElement('tr');
  editRow.id = 'pedit-'+pid;
  editRow.className = 'edit-row';
  editRow.innerHTML = `<td colspan="6"><div class="edit-inner">
    <div class="edit-grid">
      <div class="form-group" style="margin:0"><label class="form-label">Name</label>
        <input class="form-input" id="ep-name-${pid}" value="${esc(p.name)}"/></div>
      <div class="form-group" style="margin:0"><label class="form-label">Category</label>
        <select class="form-input" id="ep-cat-${pid}">${catOpts}</select></div>
      <div class="form-group" style="margin:0"><label class="form-label">Price (DT)</label>
        <input class="form-input" type="number" id="ep-price-${pid}" value="${p.price}"/></div>
      <div class="form-group" style="margin:0"><label class="form-label">Old Price (DT)</label>
        <input class="form-input" type="number" id="ep-oldprice-${pid}" value="${p.oldPrice||''}"/></div>
      <div class="form-group" style="margin:0"><label class="form-label">Stock</label>
        <input class="form-input" type="number" id="ep-stock-${pid}" value="${p.stock}"/></div>
      <div class="form-group" style="margin:0"><label class="form-label">Badge</label>
        <select class="form-input" id="ep-badge-${pid}">${badgeOpts}</select></div>
    </div>
    <div class="form-group" style="margin:0 0 .6rem"><label class="form-label">Image URL</label>
      <input class="form-input" id="ep-image-${pid}" value="${esc(p.image||'')}" placeholder="https://…"/></div>
    <div class="form-group" style="margin:0 0 .6rem"><label class="form-label">Description</label>
      <textarea class="form-input" id="ep-desc-${pid}" rows="2">${esc(p.desc||'')}</textarea></div>
    <div class="form-group" style="margin:0 0 .6rem"><label class="form-label">Specifications (Key: Value, one per line)</label>
      <textarea class="form-input" id="ep-specs-${pid}" rows="4">${esc(specsStr)}</textarea></div>
    <div class="edit-actions">
      <button class="btn btn-success btn-sm" onclick="saveProductEdit('${pid}')">Save</button>
      <button class="btn btn-secondary btn-sm" onclick="cancelEdit('${pid}')">Cancel</button>
    </div>
  </div></td>`;

  row.style.display = 'none';
  row.parentNode.insertBefore(editRow, row.nextSibling);
}

function cancelEdit(pid) {
  const editRow = document.getElementById('pedit-'+pid);
  const row     = document.getElementById('prow-'+pid);
  if (editRow) editRow.remove();
  if (row) row.style.display = '';
}

async function saveProductEdit(pid) {
  const current = getProducts().find(p => p.id === pid);
  if (!current) return;

  const edited = {
    ...current,
    name:     document.getElementById(`ep-name-${pid}`).value.trim(),
    category: document.getElementById(`ep-cat-${pid}`).value,
    price:    Number(document.getElementById(`ep-price-${pid}`).value),
    oldPrice: document.getElementById(`ep-oldprice-${pid}`).value ? Number(document.getElementById(`ep-oldprice-${pid}`).value) : null,
    stock:    Number(document.getElementById(`ep-stock-${pid}`).value),
    badge:    document.getElementById(`ep-badge-${pid}`).value || null,
    image:    document.getElementById(`ep-image-${pid}`).value.trim(),
    desc:     document.getElementById(`ep-desc-${pid}`).value.trim(),
    specs:    parseSpecs(document.getElementById(`ep-specs-${pid}`).value),
  };

  // Validate before the request so the backend receives clean product data.
  if (!edited.name) { showToast('Product name is required.','error'); return; }
  if (!edited.category) { showToast('Product category is required.','error'); return; }
  if (!Number.isFinite(edited.price) || edited.price <= 0) { showToast('Product price is required.','error'); return; }
  if (!Number.isFinite(edited.stock) || edited.stock < 0) { showToast('Product stock is required.','error'); return; }

  const result = await productBackend({
    action: 'update',
    id: pid,
    name: edited.name,
    category: edited.category,
    price: edited.price,
    old_price: edited.oldPrice,
    description: edited.desc,
    image: edited.image,
    badge: edited.badge,
    stock: edited.stock,
    specs: edited.specs
  });

  if (!result.ok) {
    showToast(result.message || 'Product update failed.','error');
    return;
  }

  await loadProductsFromBackend();
  showToast('Product updated!','success');
  cancelEdit(pid);
  renderAdminProducts();
  renderFeatured();
  renderProducts();
}

async function deleteProduct(pid) {
  if (!confirm('Delete this product? This cannot be undone.')) return;

  const result = await productBackend({
    action: 'delete',
    id: pid
  });

  if (!result.ok) {
    showToast(result.message || 'Product delete failed.','error');
    return;
  }

  await loadProductsFromBackend();
  showToast('Product deleted.','info');
  renderAdminProducts();
  renderFeatured();
  renderProducts();
  renderAdminDashboard();
}

async function handleAddProduct(e) {
  e.preventDefault();
  const errEl    = document.getElementById('apError');
  const name     = document.getElementById('ap-name').value.trim();
  const category = document.getElementById('ap-category').value;
  const price    = Number(document.getElementById('ap-price').value);
  const oldPrice = document.getElementById('ap-oldprice').value ? Number(document.getElementById('ap-oldprice').value) : null;
  const stock    = Number(document.getElementById('ap-stock').value);
  const image    = document.getElementById('ap-image').value.trim();
  const desc     = document.getElementById('ap-desc').value.trim();
  const badge    = document.getElementById('ap-badge').value || null;
  const specs    = parseSpecs(document.getElementById('ap-specs').value);

  // Required fields match the database columns that cannot be empty.
  if (!name)  { errEl.textContent = '⚠ Product name is required.'; return; }
  if (!category) { errEl.textContent = '⚠ Product category is required.'; return; }
  if (!Number.isFinite(price) || price <= 0) { errEl.textContent = '⚠ Price is required.'; return; }
  if (!Number.isFinite(stock) || stock < 0) { errEl.textContent = '⚠ Stock is required.'; return; }

  const result = await productBackend({
    action: 'create',
    name,
    category,
    price,
    old_price: oldPrice,
    description: desc,
    image,
    badge,
    stock,
    specs
  });

  if (!result.ok) {
    errEl.textContent = '⚠ ' + (result.message || 'Product add failed.');
    return;
  }

  await loadProductsFromBackend();
  ['ap-name','ap-price','ap-oldprice','ap-stock','ap-image','ap-desc','ap-specs'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('ap-badge').value = '';
  errEl.textContent = '';
  showToast(`Product "${name}" added!`,'success');
  renderFeatured();
  renderProducts();
  adminTab('products');
}

async function loadUsersFromBackend() {
  // Accounts are loaded from MySQL so newly registered users appear for admin.
  const result = await usersBackend({ action: 'list' });

  if (!result.ok || !Array.isArray(result.data?.users)) {
    userCache = [];
    showToast(result.message || 'Could not load accounts.','error');
    return userCache;
  }

  userCache = result.data.users.map(u => ({
    id: String(u.id),
    name: u.name,
    email: u.email,
    role: u.role,
    orderCount: Number(u.order_count ?? u.orderCount) || 0
  }));
  return userCache;
}

async function renderAdminAccounts() {
  const tbody = document.getElementById('accountsTableBody');
  if (!tbody) return;
  const title = document.querySelector('#tab-accounts .admin-title');
  // Rename without editing HTML so the page structure stays unchanged.
  if (title) title.textContent = 'Accounts';
  tbody.innerHTML = '<tr><td colspan="5" style="color:var(--text3)">Loading accounts...</td></tr>';
  const users = await loadUsersFromBackend();
  if (users.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="color:var(--text3)">No accounts found.</td></tr>';
    return;
  }

  tbody.innerHTML = users.map(u => {
    const userOrders = u.orderCount;
    const isMe    = currentUser && String(u.id) === String(currentUser.id);
    const isAdmin = u.role === 'admin';
    return `<tr>
      <td style="font-weight:500">${esc(u.name)}</td>
      <td style="color:var(--text2)">${esc(u.email)}</td>
      <td><span class="badge ${isAdmin?'badge-new':'badge-sale'}">${u.role}</span></td>
      <td style="color:var(--text2)">${userOrders} order${userOrders!==1?'s':''}</td>
      <td>${isMe||isAdmin
        ? `<span style="font-size:.76rem;color:var(--text3)">${isMe?'You':'Admin'}</span>`
        : `<button class="btn btn-danger" onclick="deleteAccount('${u.id}')">Delete</button>`
      }</td>
    </tr>`;
  }).join('');
}

async function deleteAccount(uid) {
  if (!currentUser) return;
  // The same rules also exist in PHP; these checks give faster feedback.
  if (String(uid) === String(currentUser.id)) { showToast('You cannot delete your own account.','error'); return; }
  const target = userCache.find(u => String(u.id) === String(uid));
  if (!target) return;
  if (target.role === 'admin') { showToast('Cannot delete another admin account.','error'); return; }
  if (target.orderCount > 0) { showToast('Cannot delete: this client has existing orders.','warn'); return; }
  if (!confirm(`Delete account for "${target.name}"? This cannot be undone.`)) return;

  const result = await usersBackend({
    action: 'delete',
    id: uid
  });

  if (!result.ok) {
    showToast(result.message || 'Account delete failed.','error');
    return;
  }

  showToast('Account deleted.','info');
  renderAdminAccounts();
}

/* ══════════════════════ TOAST ══════════════════════ */
function showToast(msg, type='info') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className   = `toast t-${type}`;
  el.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), 3500);
}
