function goCheckoutStep(n) {
  checkoutStep = n;
  for (let i = 1; i <= 3; i++) {
    const s = document.getElementById(`checkout-step-${i}`);
    const stepEl = document.getElementById(`step-${['info','shipping','payment'][i-1]}`);
    if (s) s.style.display = i === n ? '' : 'none';
    if (stepEl) {
      stepEl.classList.remove('active','done');
      if (i === n) stepEl.classList.add('active');
      else if (i < n) stepEl.classList.add('done');
      const numEl = document.getElementById(`step-${['info','shipping','payment'][i-1]}-num`);
      if (numEl && i < n) numEl.textContent = '✓';
      else if (numEl) numEl.textContent = i;
    }
  }
  renderCheckoutSummary();
}

function renderCheckoutSummary() {
  const items = document.getElementById('checkout-order-items');
  items.innerHTML = cart.map(item => `
    <div class="order-item">
      <div class="order-item-img">${item.emoji}<span class="order-item-qty-badge">${item.qty}</span></div>
      <div class="order-item-info">
        <div class="order-item-name">${item.name}</div>
        <div class="order-item-price">$${item.price.toFixed(2)} × ${item.qty}</div>
      </div>
      <div class="order-item-total">$${(item.price*item.qty).toFixed(2)}</div>
    </div>`).join('');
  const sub = cart.reduce((a,c) => a+c.price*c.qty, 0);
  const tax = sub * 0.08;
  const total = sub + checkoutShippingCost - checkoutDiscount + tax;
  document.getElementById('co-subtotal').textContent = `$${sub.toFixed(2)}`;
  document.getElementById('co-shipping-display').textContent = checkoutShippingCost === 0 ? (sub > 0 ? 'FREE' : '$0.00') : `$${checkoutShippingCost.toFixed(2)}`;
  document.getElementById('co-tax-display').textContent = `$${tax.toFixed(2)}`;
  document.getElementById('co-total').textContent = `$${Math.max(0, total).toFixed(2)}`;
}

function selectShipping(el, cost) {
  document.querySelectorAll('.shipping-option').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  checkoutShippingCost = cost;
  renderCheckoutSummary();
}

function selectPaymentMethod(el, method) {
  document.querySelectorAll('.payment-method').forEach(b => b.classList.remove('selected'));
  el.classList.add('selected');
  ['card','paypal','apple','crypto'].forEach(m => {
    const f = document.getElementById(`${m}-payment-fields`);
    if (f) f.style.display = m === method ? '' : 'none';
  });
}

function formatCardNumber(input) {
  let val = input.value.replace(/\D/g,'').substring(0,16);
  input.value = val.replace(/(.{4})/g,'$1 ').trim();
  const icon = document.getElementById('card-type-icon');
  if (val.startsWith('4')) icon.textContent = '💳';
  else if (val.startsWith('5')) icon.textContent = '🔵';
  else if (val.startsWith('3')) icon.textContent = '🟡';
  else icon.textContent = '💳';
}

function formatExpiry(input) {
  let val = input.value.replace(/\D/g,'').substring(0,4);
  if (val.length >= 2) val = val.substring(0,2) + ' / ' + val.substring(2);
  input.value = val;
}

function applyCheckoutCoupon() {
  const code = (document.getElementById('co-coupon').value||'').trim().toUpperCase();
  applyCouponCode(code);
}
function applyCheckoutCoupon2() {
  const code = (document.getElementById('co-coupon2').value||'').trim().toUpperCase();
  applyCouponCode(code);
}
function applyCouponCode(code) {
  const msg = document.getElementById('co-coupon-msg');
  if (['TESTME','FLASH30','ARCANE10'].includes(code)) {
    checkoutDiscount = 10;
    document.getElementById('co-discount-row').style.display = '';
    document.getElementById('co-discount-display').textContent = '—$10.00';
    renderCheckoutSummary();
    if (msg) msg.textContent = '✓ Coupon applied! −$10.00'; if (msg) msg.style.color = 'var(--success)';
    showToast('Coupon applied! −$10 ✓', 'success');
  } else {
    if (msg) msg.textContent = '✕ Invalid coupon code'; if (msg) msg.style.color = 'var(--danger)';
    showToast('Invalid coupon code', 'error');
  }
}

function placeOrder() {
  const email = document.getElementById('co-email').value;
  const cardNum = document.getElementById('co-cardnum').value;
  if (!email || !email.includes('@')) { showToast('Please enter your email address', 'error'); goCheckoutStep(1); return; }
  const orderId = 'ARC-' + Math.random().toString(36).substr(2,6).toUpperCase();
  document.getElementById('confirmation-order-num').textContent = '#' + orderId;
  const sub = cart.reduce((a,c) => a+c.price*c.qty, 0);
  const tax = sub * 0.08;
  const total = sub + checkoutShippingCost - checkoutDiscount + tax;
  document.getElementById('confirmation-items').innerHTML = `
    <h3 style="font-size:.875rem;font-weight:800;margin-bottom:1rem">Order Details</h3>
    ${cart.map(item => `<div style="display:flex;justify-content:space-between;padding:.4rem 0;border-bottom:1px solid var(--border);font-size:.8rem"><span>${item.emoji} ${item.name} ×${item.qty}</span><span style="font-family:'DM Mono',monospace;color:var(--accent)">$${(item.price*item.qty).toFixed(2)}</span></div>`).join('')}
    <div style="display:flex;justify-content:space-between;padding:.75rem 0 0;font-weight:800"><span>Total Paid</span><span style="font-family:'DM Mono',monospace;color:var(--accent)">$${Math.max(0,total).toFixed(2)}</span></div>
    <p style="font-size:.75rem;color:var(--muted);margin-top:.75rem">A confirmation will be sent to: <strong style="color:var(--text)">${email}</strong></p>`;
  document.getElementById('checkout-body').style.display = 'none';
  document.getElementById('confirmation-page').classList.add('active');
  cart = [];
  updateCartUI();
  showToast('Order placed successfully! 🎉', 'success');
}
