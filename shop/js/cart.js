function addToCart(id, qty = 1) {
  const p = PRODUCTS.find(x => x.id === id);
  const ex = cart.find(x => x.id === id);
  if (ex) ex.qty += qty; else cart.push({...p, qty});
  updateCartUI();
  showToast(`${p.emoji} ${p.name} added to cart!`, 'success');
}

function updateCartUI() {
  const count = cart.reduce((a,c) => a+c.qty, 0);
  document.getElementById('cart-count').textContent = count;
  const list = document.getElementById('cart-items-list');
  if (!cart.length) {
    list.innerHTML = '<p style="color:var(--muted);text-align:center;padding:2rem;font-size:.875rem">Your cart is empty 🛒</p>';
  } else {
    list.innerHTML = cart.map(item => `
      <div class="cart-item" id="cart-item-${item.id}">
        <div class="cart-item-img">${item.emoji}</div>
        <div class="cart-item-info">
          <p class="cart-item-name">${item.name}</p>
          <p class="cart-item-price">$${item.price.toFixed(2)} ea</p>
          <div class="cart-item-qty">
            <button class="qty-btn" onclick="adjustCartQty(${item.id},-1)">−</button>
            <span class="qty-val">${item.qty}</span>
            <button class="qty-btn" onclick="adjustCartQty(${item.id},1)">+</button>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:.25rem">
          <button class="cart-item-remove" onclick="removeFromCart(${item.id})">✕</button>
          <span style="font-family:'DM Mono',monospace;font-size:.75rem;color:var(--accent)">$${(item.price*item.qty).toFixed(2)}</span>
        </div>
      </div>`).join('');
  }
  const sub = cart.reduce((a,c) => a+c.price*c.qty, 0);
  const ship = sub > 75 ? 0 : (sub > 0 ? 9.99 : 0);
  const total = sub + ship;
  document.getElementById('cart-subtotal').textContent = `$${sub.toFixed(2)}`;
  document.getElementById('cart-shipping').textContent = ship === 0 ? (sub > 0 ? 'FREE' : '$0.00') : `$${ship.toFixed(2)}`;
  document.getElementById('cart-total').textContent = `$${total.toFixed(2)}`;
}

function adjustCartQty(id, delta) {
  const item = cart.find(x => x.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(x => x.id !== id);
  updateCartUI();
}

function removeFromCart(id) {
  cart = cart.filter(x => x.id !== id);
  updateCartUI();
  showToast('Item removed from cart', 'error');
}

function clearCart() { cart = []; updateCartUI(); showToast('Cart cleared', 'error'); }
function openCart() { document.getElementById('cart-overlay').classList.add('open'); document.getElementById('cart-panel').classList.add('open'); }
function closeCart() { document.getElementById('cart-overlay').classList.remove('open'); document.getElementById('cart-panel').classList.remove('open'); }

function applyCoupon() {
  const code = document.getElementById('coupon-input').value.trim().toUpperCase();
  if (['TESTME','FLASH30','ARCANE10'].includes(code)) {
    document.getElementById('cart-discount').textContent = '— $10.00';
    showToast('Coupon applied! −$10 ✓', 'success');
  } else { showToast('Invalid coupon code', 'error'); }
}

function handleCheckout() {
  if (!cart.length) { showToast('Your cart is empty!', 'error'); return; }
  closeCart();
  showPage('checkout');
}
