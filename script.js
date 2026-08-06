// ---- CONFIG ----
const WHATSAPP_NUMBER = "27790494266"; // Nontobeko Sibiya, international format (no + or leading 0)

// ---- CART STATE ----
let cart = JSON.parse(localStorage.getItem("perfumeCart") || "[]");

function saveCart() {
  localStorage.setItem("perfumeCart", JSON.stringify(cart));
  renderCart();
}

function addToCart(id) {
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) return;
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: product.id, name: product.name, price: product.price, image: product.image, qty: 1 });
  }
  saveCart();
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter(i => i.id !== id);
  }
  saveCart();
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
}

function cartTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function cartCount() {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

// ---- RENDER PRODUCTS ----
function renderProducts() {
  document.querySelectorAll(".product-grid").forEach(grid => {
    const category = grid.dataset.category;
    const items = PRODUCTS.filter(p => p.category === category);
    grid.innerHTML = items.map(p => `
      <div class="product-card">
        <img src="${p.image}" alt="${p.name}" loading="lazy">
        <div class="product-body">
          <div class="product-name">${p.name}</div>
          <div class="product-price">R${p.price}</div>
          ${renderNotes(p.notes)}
          <button class="add-btn" data-id="${p.id}">Add to Order</button>
        </div>
      </div>
    `).join("");
  });

  document.querySelectorAll(".add-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      addToCart(btn.dataset.id);
      btn.textContent = "Added ✓";
      btn.classList.add("added");
      setTimeout(() => {
        btn.textContent = "Add to Order";
        btn.classList.remove("added");
      }, 1000);
    });
  });
}

function renderNotes(notes) {
  if (!notes || (!notes.top && !notes.heart && !notes.base)) return "";
  return `
    <div class="note-pyramid">
      <span><b>Top</b>${notes.top || "—"}</span>
      <span><b>Heart</b>${notes.heart || "—"}</span>
      <span><b>Base</b>${notes.base || "—"}</span>
    </div>
  `;
}

// ---- RENDER CART ----
function renderCart() {
  const cartItemsEl = document.getElementById("cartItems");
  const cartTotalEl = document.getElementById("cartTotal");
  const cartCountEl = document.getElementById("cartCount");

  cartCountEl.textContent = cartCount();

  if (cart.length === 0) {
    cartItemsEl.innerHTML = `<p class="cart-empty">Your cart is empty. Add a scent to get started.</p>`;
    cartTotalEl.textContent = "R0";
    return;
  }

  cartItemsEl.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}">
      <div class="cart-item-info">
        <div class="name">${item.name}</div>
        <div class="price">R${item.price} × ${item.qty}</div>
        <div class="qty-controls">
          <button data-action="dec" data-id="${item.id}">−</button>
          <span>${item.qty}</span>
          <button data-action="inc" data-id="${item.id}">+</button>
          <button class="remove-btn" data-action="remove" data-id="${item.id}">Remove</button>
        </div>
      </div>
    </div>
  `).join("");

  cartTotalEl.textContent = "R" + cartTotal();

  cartItemsEl.querySelectorAll("[data-action]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const action = btn.dataset.action;
      if (action === "inc") changeQty(id, 1);
      if (action === "dec") changeQty(id, -1);
      if (action === "remove") removeFromCart(id);
    });
  });
}

// ---- WHATSAPP CHECKOUT ----
function buildWhatsAppMessage() {
  let msg = "Hi Nontobeko! I'd like to order from The Perfume Co. Africa:\n\n";
  cart.forEach(item => {
    msg += `• ${item.name} x${item.qty} — R${item.price * item.qty}\n`;
  });
  msg += `\nTotal: R${cartTotal()}\n\nPlease confirm stock, payment, and delivery. Thank you!`;
  return msg;
}

document.getElementById("checkoutBtn").addEventListener("click", () => {
  if (cart.length === 0) {
    alert("Your cart is empty — add a scent first.");
    return;
  }
  const message = encodeURIComponent(buildWhatsAppMessage());
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
});

// ---- CART DRAWER TOGGLE ----
const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");

function openCart() {
  cartDrawer.classList.add("open");
  cartOverlay.classList.add("open");
}
function closeCartDrawer() {
  cartDrawer.classList.remove("open");
  cartOverlay.classList.remove("open");
}

document.getElementById("cartBtn").addEventListener("click", openCart);
document.getElementById("closeCart").addEventListener("click", closeCartDrawer);
cartOverlay.addEventListener("click", closeCartDrawer);

// ---- INIT ----
renderProducts();
renderCart();
