// Cart functions
async function addToCart(productId, btn) {
  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

  try {
    const response = await fetch('/cart/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ productId, quantity: 1 })
    });

    // Not logged in - redirect to login
    if (response.status === 401) {
      window.location.href = '/auth/login?redirect=' + encodeURIComponent(window.location.pathname);
      return;
    }

    const data = await response.json();

    if (data.success) {
      btn.innerHTML = '<i class="fas fa-check me-1"></i>Added!';
      btn.style.background = 'var(--success)';
      const countEl = document.getElementById('cartCount');
      if (countEl && data.cartCount) countEl.textContent = data.cartCount;

      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = '';
        btn.disabled = false;
      }, 1500);
    } else {
      btn.innerHTML = originalText;
      btn.disabled = false;
      showToast(data.message || 'Could not add to cart', 'error');
    }
  } catch (e) {
    btn.innerHTML = originalText;
    btn.disabled = false;
    showToast('Network error, please try again', 'error');
  }
}

// Wishlist functions
async function toggleWishlist(btn) {
  const productId = btn.dataset.productId;

  try {
    const r = await fetch('/wishlist/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ productId })
    });

    if (r.status === 401) {
      window.location.href = '/auth/login?redirect=' + encodeURIComponent(window.location.pathname);
      return;
    }

    const d = await r.json();
    if (d.success) {
      btn.classList.toggle('active', d.added);
    }
  } catch (e) {}
}

// Toast notification
function showToast(message, type = 'info') {
  const existing = document.getElementById('ts-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'ts-toast';
  toast.style.cssText = `
    position: fixed; bottom: 24px; right: 24px; z-index: 9999;
    background: ${type === 'error' ? '#dc3545' : type === 'success' ? '#198754' : '#0d6efd'};
    color: white; padding: 12px 20px; border-radius: 10px;
    font-weight: 500; font-size: 0.9rem; box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    transition: opacity 0.3s; max-width: 300px;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3000);
}

// Load cart count on page load
async function loadCartCount() {
  const el = document.getElementById('cartCount');
  if (!el) return;
  try {
    const r = await fetch('/cart/count', {
      credentials: 'same-origin',
      headers: { 'Accept': 'application/json' }
    });
    if (!r.ok) return;
    const d = await r.json();
    if (d.count > 0) el.textContent = d.count;
  } catch(e) {}
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadCartCount();

  document.querySelectorAll('.alert-custom').forEach(alert => {
    setTimeout(() => { alert.style.opacity = '0'; alert.style.transition = 'opacity 0.5s'; }, 4000);
  });

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });
});