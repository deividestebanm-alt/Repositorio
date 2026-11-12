/* =========================================================
   PATACÓN DORADO — Lógica del prototipo
   - Menú con filtros, ilustraciones SVG por producto
   - Carrito con localStorage y pedido por WhatsApp
   ========================================================= */

const CONFIG = {
  whatsappNumber: "573000000000", // Cambia por el WhatsApp real (país + número, sin + ni espacios)
  deliveryFee: 5000,
  freeDeliveryFrom: 50000,
  storageKey: "patacondoradoCart"
};

/* Para usar fotos reales: agrega  img: "fotos/archivo.jpg"  a un producto y reemplaza la ilustración. */
const PRODUCTS = [
  // Clásicos
  { id: 1,  name: "Patacón sencillo",        category: "clasicos",  price: 12000, art: ["🧀", "🍅"],               desc: "Dos patacones gigantes con hogao casero, queso rallado y salsa de la casa." },
  { id: 2,  name: "Patacón con huevo",       category: "clasicos",  price: 13500, art: ["🍳", "🧀", "🍅"],         desc: "Patacón crocante con huevo frito, queso derretido y hogao." },
  { id: 3,  name: "Patacón de pollo",        category: "clasicos",  price: 16000, art: ["🍗", "🧀", "🥬"],         desc: "Pollo desmechado jugoso, queso gratinado, lechuga y salsa rosada." },

  // Mix de carnes
  { id: 4,  name: "Patacón mixto",           category: "carnes",    price: 24000, art: ["🥩", "🍗", "🐖", "🧀"],   desc: "Res, pollo y cerdo desmechados sobre patacón, con queso y hogao.", badge: "Más pedido", star: true },
  { id: 5,  name: "Mix de carnes XL",        category: "carnes",    price: 32000, art: ["🥩", "🍗", "🐖", "🌭", "🧀"], desc: "Res, pollo, cerdo, chorizo y chicharrón. Para compartir (o no).", badge: "Para compartir", star: true },
  { id: 6,  name: "Patacón de res desmechada", category: "carnes",  price: 18500, art: ["🥩", "🧅", "🧀"],         desc: "Carne desmechada en salsa criolla con queso y cebolla caramelizada." },
  { id: 7,  name: "Patacón costilla BBQ",    category: "carnes",    price: 26000, art: ["🍖", "🔥", "🧀"],         desc: "Costilla de cerdo bañada en salsa BBQ ahumada y queso fundido.", badge: "Ahumada" },

  // Papa ángel
  { id: 8,  name: "Patacón con papa ángel",  category: "papa",      price: 19000, art: ["🍟", "🍗", "🧀"],         desc: "Nido de papa ángel crocante, pollo desmechado, queso y salsas.", badge: "Crocante" },
  { id: 9,  name: "Papa ángel + mix de carnes", category: "papa",   price: 28000, art: ["🍟", "🥩", "🍗", "🐖"],   desc: "Montaña de papa ángel con res, pollo y cerdo sobre patacón.", badge: "Bestia", star: true },
  { id: 10, name: "Papa ángel gratinada",    category: "papa",      price: 15000, art: ["🍟", "🧀", "🥓"],         desc: "Papa ángel con queso gratinado, tocineta y salsa de ajo.", },

  // Mazorcadas
  { id: 11, name: "Mazorcada con patacón",   category: "mazorcada", price: 20000, art: ["🌽", "🍗", "🥓", "🧀"],   desc: "Maíz tierno, pollo, tocineta, queso y trozos de patacón crocante.", badge: "Favorita", star: true },
  { id: 12, name: "Mazorcada mix de carnes", category: "mazorcada", price: 27500, art: ["🌽", "🥩", "🍗", "🐖", "🧀"], desc: "Maíz, res, pollo, cerdo, papa ángel y pedazos de patacón por todos lados." },
  { id: 13, name: "Mazorcada vegetariana",   category: "mazorcada", price: 16500, art: ["🌽", "🍄", "🧀", "🥑"],   desc: "Maíz, champiñones, queso, aguacate y trozos de patacón.", badge: "Veggie", veg: true },

  // Bebidas y extras
  { id: 14, name: "Limonada de coco",        category: "bebidas",   price: 7500,  art: ["🥥", "🍋"],               desc: "Cremosa, helada y con coco natural." },
  { id: 15, name: "Jugo de maracuyá",        category: "bebidas",   price: 6500,  art: ["🍹", "🥭"],               desc: "Natural, en agua o en leche. Recién hecho." },
  { id: 16, name: "Gaseosa personal",        category: "bebidas",   price: 4500,  art: ["🥤"],                     desc: "Para bajar tanto antojo." },
  { id: 17, name: "Porción de patacones x4", category: "bebidas",   price: 6000,  art: ["🍌", "🧂"],               desc: "Cuatro patacones extra, con sal y limón." }
];

const CATEGORY_COLORS = {
  clasicos:  ["#ffe45e", "#ffb100"],
  carnes:    ["#ff7a3d", "#c8102e"],
  papa:      ["#ffd166", "#ef8d00"],
  mazorcada: ["#9be564", "#2a9d3f"],
  bebidas:   ["#7fd6ff", "#1e78d6"]
};

/* ---------- Utilidades ---------- */
const $ = (s, scope = document) => scope.querySelector(s);
const $$ = (s, scope = document) => [...scope.querySelectorAll(s)];
const formatCOP = (v) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(v);

const productsGrid = $("#products");
const starsGrid = $("#starsGrid");
const filterButtons = $$(".filter");
const cartEl = $("#cart"), overlay = $("#overlay");
const cartItemsEl = $("#cartItems"), cartEmptyEl = $("#cartEmpty"), cartFooterEl = $("#cartFooter");
const cartCountEl = $("#cartCount"), cartSubtotalEl = $("#cartSubtotal"), cartDeliveryEl = $("#cartDelivery");
const cartTotalEl = $("#cartTotal"), cartHintEl = $("#cartHint"), toastEl = $("#toast");
const header = $("#header"), nav = $("#nav"), menuToggle = $("#menuToggle");

/* =========================================================
   1. ILUSTRACIONES SVG
   Plato + patacones dorados + ingredientes del producto
   ========================================================= */
function art(p, big = false) {
  const [c1, c2] = CATEGORY_COLORS[p.category] || CATEGORY_COLORS.clasicos;
  const gid = `g${p.id}${big ? "b" : ""}`;
  const spots = [[150, 98], [112, 112], [188, 112], [130, 138], [172, 138]];
  const items = (p.art || []).slice(0, 5);

  const discs = [[100, 128], [150, 138], [200, 128]].map(([x, y]) => `
    <ellipse cx="${x}" cy="${y}" rx="34" ry="24" fill="url(#pat${gid})" stroke="#b7740a" stroke-width="2"/>
    <ellipse cx="${x - 6}" cy="${y - 7}" rx="14" ry="6" fill="#fff" opacity=".35"/>
    <circle cx="${x + 10}" cy="${y + 4}" r="2.5" fill="#b7740a" opacity=".5"/>
    <circle cx="${x - 14}" cy="${y + 6}" r="2" fill="#b7740a" opacity=".5"/>`).join("");

  const emojis = items.map((e, i) => {
    const [x, y] = spots[i];
    const size = i === 0 ? 50 : 38;
    return `<text x="${x}" y="${y + size / 3}" font-size="${size}" text-anchor="middle" style="filter:drop-shadow(0 4px 4px rgba(0,0,0,.35))">${e}</text>`;
  }).join("");

  const sparks = [[34, 40], [266, 52], [250, 160], [44, 150]].map(([x, y], i) =>
    `<text x="${x}" y="${y}" font-size="${14 + i * 3}" opacity=".55">✦</text>`).join("");

  return `
  <svg viewBox="0 0 300 200" role="img" aria-label="${p.name}" preserveAspectRatio="xMidYMid slice">
    <defs>
      <radialGradient id="bg${gid}" cx="50%" cy="45%" r="75%">
        <stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/>
      </radialGradient>
      <radialGradient id="pat${gid}" cx="40%" cy="35%" r="75%">
        <stop offset="0" stop-color="#ffe27a"/><stop offset=".6" stop-color="#f2b134"/><stop offset="1" stop-color="#d98a12"/>
      </radialGradient>
    </defs>
    <rect width="300" height="200" fill="url(#bg${gid})"/>
    <g fill="#fff">${sparks}</g>
    <ellipse cx="150" cy="150" rx="118" ry="36" fill="rgba(0,0,0,.22)"/>
    <ellipse cx="150" cy="138" rx="116" ry="42" fill="#fffdf6" stroke="rgba(0,0,0,.12)" stroke-width="3"/>
    <ellipse cx="150" cy="138" rx="92" ry="31" fill="none" stroke="rgba(0,0,0,.08)" stroke-width="2"/>
    ${discs}
    ${emojis}
  </svg>`;
}

/* =========================================================
   2. MENÚ
   ========================================================= */
function productCard(p, index) {
  const image = p.img
    ? `<img src="${p.img}" alt="${p.name}" loading="lazy">`
    : art(p);
  return `
    <article class="product" style="animation-delay:${index * 0.05}s">
      <div class="product__image">
        ${p.badge ? `<span class="product__badge ${p.veg ? "product__badge--veg" : ""}">${p.badge}</span>` : ""}
        ${image}
      </div>
      <div class="product__body">
        <h3 class="product__name">${p.name}</h3>
        <p class="product__desc">${p.desc}</p>
        <div class="product__footer">
          <span class="product__price">${formatCOP(p.price)}</span>
          <button class="product__add" data-id="${p.id}" aria-label="Agregar ${p.name} al carrito">+ Agregar</button>
        </div>
      </div>
    </article>`;
}

function renderProducts(filter = "todos") {
  const list = filter === "todos" ? PRODUCTS : PRODUCTS.filter((p) => p.category === filter);
  productsGrid.innerHTML = list.map(productCard).join("");
}

function renderStars() {
  starsGrid.innerHTML = PRODUCTS.filter((p) => p.star).map(productCard).join("");
}

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => { b.classList.remove("is-active"); b.setAttribute("aria-selected", "false"); });
    btn.classList.add("is-active");
    btn.setAttribute("aria-selected", "true");
    renderProducts(btn.dataset.filter);
  });
});

[productsGrid, starsGrid].forEach((grid) =>
  grid.addEventListener("click", (e) => {
    const btn = e.target.closest(".product__add");
    if (btn) addToCart(Number(btn.dataset.id));
  })
);

/* =========================================================
   3. CARRITO
   ========================================================= */
let cart = loadCart();

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(CONFIG.storageKey));
    return Array.isArray(saved) ? saved.filter((i) => PRODUCTS.some((p) => p.id === i.id) && i.qty > 0) : [];
  } catch { return []; }
}
function saveCart() { try { localStorage.setItem(CONFIG.storageKey, JSON.stringify(cart)); } catch {} }
const getProduct = (id) => PRODUCTS.find((p) => p.id === id);

function addToCart(id) {
  const item = cart.find((i) => i.id === id);
  item ? item.qty++ : cart.push({ id, qty: 1 });
  updateCart();
  bumpCounter();
  showToast(`✅ ${getProduct(id).name} agregado`);
}
function changeQty(id, delta) {
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  item.qty += delta;
  item.qty <= 0 ? removeFromCart(id) : updateCart();
}
function removeFromCart(id) { cart = cart.filter((i) => i.id !== id); updateCart(); }
function clearCart() { cart = []; updateCart(); }

function getTotals() {
  const subtotal = cart.reduce((s, i) => s + getProduct(i.id).price * i.qty, 0);
  const delivery = subtotal === 0 || subtotal >= CONFIG.freeDeliveryFrom ? 0 : CONFIG.deliveryFee;
  const units = cart.reduce((s, i) => s + i.qty, 0);
  return { subtotal, delivery, total: subtotal + delivery, units };
}

function renderCart() {
  const { subtotal, delivery, total, units } = getTotals();
  const isEmpty = cart.length === 0;
  cartEmptyEl.hidden = !isEmpty;
  cartFooterEl.classList.toggle("is-hidden", isEmpty);
  cartCountEl.textContent = units;

  cartItemsEl.innerHTML = cart.map(({ id, qty }) => {
    const p = getProduct(id);
    return `
      <li class="cart-item">
        <span class="cart-item__icon" aria-hidden="true">${p.art[0]}</span>
        <div>
          <p class="cart-item__name">${p.name}</p>
          <p class="cart-item__price">${formatCOP(p.price)} c/u · ${formatCOP(p.price * qty)}</p>
        </div>
        <div class="cart-item__controls">
          <div class="qty">
            <button data-action="minus" data-id="${id}" aria-label="Quitar uno">−</button>
            <span>${qty}</span>
            <button data-action="plus" data-id="${id}" aria-label="Agregar uno">+</button>
          </div>
          <button class="cart-item__remove" data-action="remove" data-id="${id}">Eliminar</button>
        </div>
      </li>`;
  }).join("");

  cartSubtotalEl.textContent = formatCOP(subtotal);
  cartDeliveryEl.textContent = delivery === 0 && subtotal > 0 ? "¡Gratis!" : formatCOP(delivery);
  cartTotalEl.textContent = formatCOP(total);

  if (subtotal > 0 && subtotal < CONFIG.freeDeliveryFrom) {
    cartHintEl.textContent = `Te faltan ${formatCOP(CONFIG.freeDeliveryFrom - subtotal)} para domicilio gratis 🛵`;
  } else if (subtotal >= CONFIG.freeDeliveryFrom) {
    cartHintEl.textContent = "🎉 Tienes domicilio gratis";
  } else {
    cartHintEl.textContent = "";
  }
}
function updateCart() { saveCart(); renderCart(); }

cartItemsEl.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const id = Number(btn.dataset.id);
  ({ plus: () => changeQty(id, 1), minus: () => changeQty(id, -1), remove: () => removeFromCart(id) })[btn.dataset.action]?.();
});

$("#cartClear").addEventListener("click", () => {
  if (cart.length && confirm("¿Seguro que quieres vaciar el carrito?")) {
    clearCart();
    showToast("🗑️ Carrito vacío");
  }
});

function bumpCounter() {
  cartCountEl.classList.remove("bump");
  void cartCountEl.offsetWidth;
  cartCountEl.classList.add("bump");
}

function openCart() {
  cartEl.classList.add("is-open");
  cartEl.setAttribute("aria-hidden", "false");
  overlay.hidden = false;
  requestAnimationFrame(() => overlay.classList.add("is-visible"));
  document.body.classList.add("no-scroll");
  closeNav();
  $("#cartClose").focus();
}
function closeCart() {
  cartEl.classList.remove("is-open");
  cartEl.setAttribute("aria-hidden", "true");
  overlay.classList.remove("is-visible");
  document.body.classList.remove("no-scroll");
  setTimeout(() => { overlay.hidden = true; }, 250);
}
$("#cartOpen").addEventListener("click", openCart);
$("#cartClose").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && cartEl.classList.contains("is-open")) closeCart(); });

/* =========================================================
   4. FORMULARIOS
   ========================================================= */
function setError(input, message) {
  const field = input.closest(".field");
  field.classList.toggle("has-error", Boolean(message));
  $(".field__error", field).textContent = message || "";
}
function validateRequired(input, message) {
  const ok = input.value.trim().length > 0;
  setError(input, ok ? "" : message);
  return ok;
}
function validateEmail(input) {
  const v = input.value.trim();
  if (!v) { setError(input, "Escribe tu correo."); return false; }
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  setError(input, ok ? "" : "El correo no parece válido.");
  return ok;
}
$$(".field input, .field textarea").forEach((i) => i.addEventListener("input", () => setError(i, "")));

$("#checkoutForm").addEventListener("submit", (e) => {
  e.preventDefault();
  if (cart.length === 0) return;
  const nameInput = $("#customerName"), addressInput = $("#customerAddress");
  const payment = $("#paymentMethod").value;
  const okName = validateRequired(nameInput, "Escribe tu nombre.");
  const okAddr = validateRequired(addressInput, "Escribe la dirección de entrega.");
  if (!okName || !okAddr) return;

  const { subtotal, delivery, total } = getTotals();
  const lines = cart.map(({ id, qty }) => {
    const p = getProduct(id);
    return `• ${qty} x ${p.name} — ${formatCOP(p.price * qty)}`;
  });
  const message = [
    "¡Hola, Patacón Dorado! 🍌🔥 Quiero hacer este pedido:", "",
    ...lines, "",
    `Subtotal: ${formatCOP(subtotal)}`,
    `Domicilio: ${delivery === 0 ? "Gratis" : formatCOP(delivery)}`,
    `*Total: ${formatCOP(total)}*`, "",
    `👤 Nombre: ${nameInput.value.trim()}`,
    `📍 Dirección: ${addressInput.value.trim()}`,
    `💳 Pago: ${payment}`
  ].join("\n");

  window.open(`https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
  showToast("💬 Abriendo WhatsApp con tu pedido…");
});

$("#contactForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const ok = [
    validateRequired($("#contactName"), "Escribe tu nombre."),
    validateEmail($("#contactEmail")),
    validateRequired($("#contactMessage"), "Escribe un mensaje.")
  ].every(Boolean);
  if (!ok) return;
  e.currentTarget.reset();
  showToast("📨 ¡Gracias! Te responderemos pronto.");
});

/* =========================================================
   5. INTERFAZ
   ========================================================= */
let toastTimer;
function showToast(text) {
  toastEl.textContent = text;
  toastEl.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("is-visible"), 2200);
}

function closeNav() {
  nav.classList.remove("is-open");
  menuToggle.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
}
menuToggle.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  menuToggle.classList.toggle("is-open", open);
  menuToggle.setAttribute("aria-expanded", String(open));
});
$$(".nav__link").forEach((l) => l.addEventListener("click", closeNav));

window.addEventListener("scroll", () => header.classList.toggle("is-scrolled", window.scrollY > 10), { passive: true });

const navLinks = $$(".nav__link");
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === `#${entry.target.id}`));
  });
}, { rootMargin: "-45% 0px -50% 0px" });
$$("main section[id]").forEach((s) => observer.observe(s));

$("#year").textContent = new Date().getFullYear();

/* ---------- Inicio ---------- */
$("#heroArt").innerHTML = art({ id: 0, name: "Patacón mixto con papa ángel", category: "carnes", art: ["🥩", "🍟", "🍗", "🌽", "🧀"] }, true);
renderProducts();
renderStars();
renderCart();
