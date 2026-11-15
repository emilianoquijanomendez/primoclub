// Estado global de la tienda
const Store = {
    products: [
        { id: 1, name: 'Playera Essentials', category: 'playeras', price: 1000, originalPrice: 1500, tag: 'MÁS VENDIDA', description: 'Diseño impecable y minimalista con acabado de lujo para uso diario.', image: 'playera.jpg', fallbackImage: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=700&q=80', cleanWhiteBg: true, sizes: ['S', 'M', 'L', 'XL'] },
        { id: 2, name: 'Hoodie Essentials', category: 'hoodies', price: 1999, originalPrice: 2500, tag: 'OFERTA ESPECIAL', description: 'Sudadera con gorro de doble capa, corte boxy fit y acabado premium.', image: 'hoodie.jpg', fallbackImage: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=700&q=80', cleanWhiteBg: true, sizes: ['S', 'M', 'L', 'XL'] },
        { id: 3, name: 'Sueter Alo', category: 'sudaderas', price: 2499, originalPrice: 3000, tag: 'OFERTA ESPECIAL', description: 'Suéter de alta gama con texturas exclusivas, diseño minimalista y confort absoluto.', image: 'salo.jpg', fallbackImage: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=700&q=80', cleanWhiteBg: true, sizes: ['S', 'M', 'L', 'XL'] },
        { id: 4, name: 'Playera Off-White', category: 'playeras', price: 3000, originalPrice: 4000, tag: 'OFERTA ESPECIAL', description: 'Playera de diseño urbano prémium con detalles gráficos y excelente calidad.', image: 'offwhite.jpg', fallbackImage: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=700&q=80', cleanWhiteBg: true, sizes: ['S', 'M', 'L', 'XL'] }
    ],
    cart: JSON.parse(localStorage.getItem('primo_cart')) || [],
    selectedSizes: {},
    FREE_SHIPPING_THRESHOLD: 2999,
    SHIPPING_COST: 250,

    init() {
        this.products.forEach(p => this.selectedSizes[p.id] = p.sizes[0]);
        this.renderProducts();
        this.updateCartUI();
        lucide.createIcons();
    },

    saveCart() {
        localStorage.setItem('primo_cart', JSON.stringify(this.cart));
        this.updateCartUI();
    },

    selectSize(productId, size) {
        this.selectedSizes[productId] = size;
        this.renderProducts();
    },

    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        const size = this.selectedSizes[productId];
        const cartKey = `${productId}-${size}`;
        const existingItem = this.cart.find(item => item.cartKey === cartKey);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({ ...product, cartKey, size, quantity: 1 });
        }

        this.saveCart();
        toggleCart();
        showToast(`Agregado: ${product.name} (Talla ${size})`);
    },

    updateQuantity(cartKey, delta) {
        const itemIndex = this.cart.findIndex(item => item.cartKey === cartKey);
        if (itemIndex > -1) {
            this.cart[itemIndex].quantity += delta;
            if (this.cart[itemIndex].quantity <= 0) this.cart.splice(itemIndex, 1);
            this.saveCart();
        }
    },

    renderProducts() {
        const grid = document.getElementById('products-grid');
        grid.innerHTML = this.products.map(product => {
            const activeSize = this.selectedSizes[product.id];
            const imgClass = product.cleanWhiteBg 
                ? 'object-contain transition duration-700 w-full h-full' 
                : 'object-cover grayscale contrast-110 transition duration-700 w-full h-full';
            
            return `
                <article class="product-card bg-primo-card border border-primo-border rounded-3xl overflow-hidden flex flex-col shadow-xl">
                    <div class="relative aspect-[4/5] ${product.cleanWhiteBg ? 'bg-white p-5' : 'bg-zinc-950'}">
                        <img src="${product.image}" loading="lazy" alt="${product.name}" class="${imgClass}" onerror="this.src='${product.fallbackImage}'">
                        <span class="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-zinc-700 text-white text-[10px] font-bold uppercase">${product.tag}</span>
                    </div>
                    <div class="p-6 flex-1 flex flex-col">
                        <h3 class="font-display font-bold text-xl text-white mb-2">${product.name}</h3>
                        <p class="text-xs text-primo-muted mb-4 flex-1">${product.description}</p>
                        <div class="flex flex-wrap gap-2 mb-4">
                            ${product.sizes.map(size => `
                                <button onclick="Store.selectSize(${product.id}, '${size}')" 
                                    class="px-3 py-1.5 rounded-xl text-xs font-bold border transition ${activeSize === size ? 'bg-white text-black border-white' : 'bg-primo-dark text-zinc-300 border-zinc-800'}">
                                    ${size}
                                </button>
                            `).join('')}
                        </div>
                        <div class="flex items-center justify-between mb-4 border-t border-primo-border pt-4">
                            <span class="font-display font-extrabold text-white text-lg">$${product.price.toLocaleString('es-MX')} MXN</span>
                        </div>
                        <button onclick="Store.addToCart(${product.id})" class="w-full py-3 rounded-2xl bg-white hover:bg-zinc-200 text-black font-bold text-xs uppercase flex items-center justify-center gap-2">
                            <i data-lucide="plus" class="w-4 h-4"></i> Agregar
                        </button>
                    </div>
                </article>
            `;
        }).join('');
        lucide.createIcons();
    },

    updateCartUI() {
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        
        document.getElementById('cart-badge').textContent = totalItems;
        document.getElementById('cart-subtotal').textContent = `$${subtotal.toLocaleString('es-MX')} MXN`;

        const remaining = Math.max(0, this.FREE_SHIPPING_THRESHOLD - subtotal);
        document.getElementById('free-shipping-bar').style.width = `${Math.min(100, (subtotal / this.FREE_SHIPPING_THRESHOLD) * 100)}%`;

        const isFree = subtotal >= this.FREE_SHIPPING_THRESHOLD && subtotal > 0;
        document.getElementById('free-shipping-text').innerHTML = isFree 
            ? `<span class="text-white font-bold">¡ENVÍO GRATIS ALCANZADO!</span>`
            : `Faltan <span class="text-white font-bold">$${remaining.toLocaleString('es-MX')}</span> para ENVÍO GRATIS`;
        
        const shippingCost = (subtotal === 0 || isFree) ? 0 : this.SHIPPING_COST;
        document.getElementById('cart-shipping').textContent = isFree ? 'GRATIS' : `$${shippingCost} MXN`;
        document.getElementById('cart-total').textContent = `$${(subtotal + shippingCost).toLocaleString('es-MX')} MXN`;

        const container = document.getElementById('cart-items-container');
        if (this.cart.length === 0) {
            container.innerHTML = `<div class="text-center py-10 text-primo-muted">Tu carrito está vacío</div>`;
            document.getElementById('checkout-btn').disabled = true;
            return;
        }

        document.getElementById('checkout-btn').disabled = false;
        container.innerHTML = this.cart.map(item => `
            <div class="flex gap-4 p-3 rounded-2xl bg-primo-card border border-primo-border mb-3">
                <img src="${item.image}" onerror="this.src='${item.fallbackImage}'" class="w-16 h-20 rounded-xl object-cover">
                <div class="flex-1 flex flex-col justify-between">
                    <div class="flex justify-between">
                        <h4 class="font-bold text-sm text-white">${item.name} <span class="text-xs text-zinc-400">(${item.size})</span></h4>
                        <button onclick="Store.updateQuantity('${item.cartKey}', -${item.quantity})" class="text-zinc-500 hover:text-white"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                    </div>
                    <div class="flex justify-between items-center mt-2">
                        <span class="font-bold text-white">$${(item.price * item.quantity).toLocaleString('es-MX')}</span>
                        <div class="flex gap-2 bg-black rounded-xl px-2 py-1">
                            <button onclick="Store.updateQuantity('${item.cartKey}', -1)" class="text-white">-</button>
                            <span class="text-xs font-bold text-white w-4 text-center">${item.quantity}</span>
                            <button onclick="Store.updateQuantity('${item.cartKey}', 1)" class="text-white">+</button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        lucide.createIcons();
    },

    checkoutWhatsApp() {
        if (this.cart.length === 0) return;
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shippingCost = subtotal >= this.FREE_SHIPPING_THRESHOLD ? 0 : this.SHIPPING_COST;
        
        let msg = `Hola *PRIMO CLUB*, quiero hacer un pedido:%0A%0A` + 
            this.cart.map((i, idx) => `${idx + 1}. *${i.name}* (Talla: ${i.size}) x${i.quantity} - $${i.price * i.quantity}`).join('%0A') +
            `%0A%0ASubtotal: $${subtotal}%0AEnvío: ${shippingCost === 0 ? 'GRATIS' : '$'+shippingCost}%0A*Total: $${subtotal + shippingCost} MXN*`;
        window.open(`https://wa.me/9812059251?text=${msg}`, '_blank');
    }
};

// Funciones de UI Globales
function toggleCart() { document.getElementById('cart-drawer').classList.toggle('hidden'); }
function openSizeGuide() { document.getElementById('size-guide-modal').classList.replace('hidden', 'flex'); }
function closeSizeGuide() { document.getElementById('size-guide-modal').classList.replace('flex', 'hidden'); }
function closeMobileMenu() { document.getElementById('mobile-menu').classList.add('hidden'); }
document.getElementById('mobile-menu-btn').addEventListener('click', () => document.getElementById('mobile-menu').classList.toggle('hidden'));

function showToast(text) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'bg-primo-dark border border-white/40 text-white px-4 py-3 rounded-2xl mb-2 flex items-center gap-3 text-xs transition-opacity duration-300';
    toast.innerHTML = `<i data-lucide="check-circle-2" class="w-4 h-4"></i><span>${text}</span>`;
    container.appendChild(toast);
    lucide.createIcons();
    setTimeout(() => { toast.classList.add('opacity-0'); setTimeout(() => toast.remove(), 300); }, 2500);
}

window.addEventListener('DOMContentLoaded', () => Store.init());