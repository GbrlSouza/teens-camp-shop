// Product data (will be loaded from products.json)
let productsData = {};

// Shopping cart
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// DOM elements
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');
const cartIcon = document.getElementById('cart-icon');
const cartModal = document.getElementById('cart-modal');
const closeCart = document.getElementById('close-cart');
const cartItemsContainer = document.getElementById('cart-items-container');
const emptyCartMessage = document.getElementById('empty-cart-message');
const cartTotal = document.getElementById('cart-total');
const cartCount = document.getElementById('cart-count');
const checkoutButton = document.getElementById('checkout-button');
const productsContainer = document.getElementById('products-container');
const categoryTabs = document.querySelectorAll('.category-tab');
const quickViewModal = document.getElementById('quick-view-modal');
const closeQuickView = document.getElementById('close-quick-view');
const quickViewTitle = document.getElementById('quick-view-title');
const quickViewImage = document.getElementById('quick-view-image');
const quickViewProductName = document.getElementById('quick-view-product-name');
const quickViewDescription = document.getElementById('quick-view-description');
const quickViewPrice = document.getElementById('quick-view-price');
const quickViewColors = document.getElementById('quick-view-colors');
const quickViewSizes = document.getElementById('quick-view-sizes');
const decreaseQuantity = document.getElementById('decrease-quantity');
const increaseQuantity = document.getElementById('increase-quantity');
const quantityElement = document.getElementById('quantity');
const addToCartQuickView = document.getElementById('add-to-cart-quick-view');
const toastNotification = document.getElementById('toast-notification');
const toastMessage = document.getElementById('toast-message');

// Current product for quick view
let currentProduct = null;
let currentColor = null;
let currentSize = null;
let currentQuantity = 1;

// Fetch product data from JSON file
fetch('products.json')
    .then(response => response.json())
    .then(data => {
        productsData = data;
        // Initialize with first category selected after data is loaded
        if (categoryTabs.length > 0) {
            categoryTabs[0].classList.add('bg-red-100', 'text-red-600');
            loadProducts(categoryTabs[0].dataset.category);
        }
        updateCartCount(); // Also update cart count after data is loaded
    })
    .catch(error => console.error('Error loading product data:', error));

// Mobile menu toggle
mobileMenuButton.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
});

// Cart toggle
cartIcon.addEventListener('click', () => {
    cartModal.classList.remove('hidden');
    renderCartItems();
});

closeCart.addEventListener('click', () => {
    cartModal.classList.add('hidden');
});

// Quick view modal
closeQuickView.addEventListener('click', () => {
    quickViewModal.classList.add('hidden');
});

// Quantity controls
decreaseQuantity.addEventListener('click', () => {
    if (currentQuantity > 1) {
        currentQuantity--;
        quantityElement.textContent = currentQuantity;
    }
});

increaseQuantity.addEventListener('click', () => {
    currentQuantity++;
    quantityElement.textContent = currentQuantity;
});

// Category tabs
categoryTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        // Remove active class from all tabs
        categoryTabs.forEach(t => t.classList.remove('bg-red-100', 'text-red-600'));

        // Add active class to clicked tab
        tab.classList.add('bg-red-100', 'text-red-600');

        // Load products for selected category
        const category = tab.dataset.category;
        loadProducts(category);
    });
});

// Load products for a category
function loadProducts(categoryName) {
    productsContainer.innerHTML = '';

    const category = productsData.categorias.find(cat =>
        cat.nome.toLowerCase() === categoryName.toLowerCase()
    );

    if (category) {
        category.produtos.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card bg-white rounded-lg overflow-hidden relative';

            // Generate a random image URL based on category and product name
            const imageUrl = getProductImageUrl(category.nome, product.nome);

            productCard.innerHTML = `
                <div class="h-64 overflow-hidden relative">
                    <img src="${imageUrl}" alt="${product.nome}" class="w-full h-full object-cover product-image">
                    <div class="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition duration-300 flex items-center justify-center">
                        <button class="quick-view-btn opacity-0 hover:opacity-100 transform translate-y-4 hover:translate-y-0 transition duration-300 bg-red-600 text-white px-4 py-2 rounded-full font-medium" data-product-id="${product.id}">
                            Ver Detalhes
                        </button>
                    </div>
                </div>
                <div class="p-4">
                    <h3 class="font-bold text-lg mb-1">${product.nome}</h3>
                    <p class="text-gray-600 text-sm mb-2">${product.descricao.substring(0, 60)}...</p>
                    <div class="flex justify-between items-center">
                        <span class="font-bold text-red-600">R$ ${product.preco.toFixed(2)}</span>
                        <button class="add-to-cart bg-gray-200 hover:bg-red-600 hover:text-white text-gray-800 px-3 py-1 rounded-full text-sm transition duration-300" data-product-id="${product.id}">
                            <i class="fas fa-cart-plus mr-1"></i> Adicionar
                        </button>
                    </div>
                </div>
            `;

            productsContainer.appendChild(productCard);
        });

        // Add event listeners to quick view buttons
        document.querySelectorAll('.quick-view-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.currentTarget.dataset.productId;
                showQuickView(productId);
            });
        });

        // Add event listeners to add to cart buttons
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.currentTarget.dataset.productId;
                addToCart(productId);
            });
        });
    }
}

// Get a product image URL based on category and product name
function getProductImageUrl(category, productName) {
    // This is a placeholder - in a real app, you would have actual image URLs
    const baseUrl = 'https://images.unsplash.com/photo-';
    const categoryMap = {
        'Feminino': 'women',
        'Masculino': 'men',
        'Acessórios': 'accessories'
    };

    const categoryTerm = categoryMap[category] || 'clothing';
    const productTerm = productName.toLowerCase().replace(/ /g, '-').replace(/'/g, '');

    // Some example image IDs that match our product categories
    const imageIds = {
        'Feminino': [
            '1489987707025-afc232f7ea0f', // Fashion 1
            '1525507119028-ed4c629a60a3', // Fashion 2
            '1595341888016-a392ef81b7de', // Fashion 3
            '1539109136881-3be0616acf4b', // Fashion 4
            '1492707892479-7bc8d5a4ee93', // Fashion 5
            '1515886653613-03411f6728b1', // Fashion 6
            '1542272604-787c2835535d', // Fashion 7
            '1519699047748-7eab79b4a256'  // Fashion 8
        ],
        'Masculino': [
            '1591047139829-d91aecb6caea', // Men's fashion 1
            '1506794778202-cad84cf45f1d', // Men's fashion 2
            '1517841905240-472988babdf9', // Men's fashion 3
            '1519085360753-af0119f7cbe7', // Men's fashion 4
            '1519340245124-312d5d2e8b5d', // Men's fashion 5
            '1517849847487-4029829449cb', // Men's fashion 6
            '1489987707025-afc232f7ea0f', // Men's fashion 7
            '1525507119028-ed4c629a60a3'  // Men's fashion 8
        ],
        'Acessórios': [
            '1592155931584-901ac15763e3', // Accessories 1
            '1522335789203-aabd1fc54bc9', // Accessories 2
            '1511499767150-a89a7d118669', // Accessories 3
            '1518895949257-26021a6efaf9', // Accessories 4
            '1518894784611-936e85ddf7e4', // Accessories 5
            '1518894784611-936e85ddf7e4', // Accessories 6
            '1518894784611-936e85ddf7e4', // Accessories 7
            '1518894784611-936e85ddf7e4'  // Accessories 8
        ]
    };

    // Get a random image ID for the category
    const ids = imageIds[category] || imageIds['Feminino'];
    const randomIndex = Math.floor(Math.random() * ids.length);
    return `${baseUrl}${ids[randomIndex]}?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80`;
}

// Show quick view modal for a product
function showQuickView(productId) {
    // Find the product
    let product = null;
    for (const category of productsData.categorias) {
        product = category.produtos.find(p => p.id === productId);
        if (product) break;
    }

    if (product) {
        currentProduct = product;
        currentQuantity = 1;
        currentColor = product.cores && product.cores.length > 0 ? product.cores[0] : null;
        currentSize = product.tamanhos && product.tamanhos.length > 0 ? product.tamanhos[0] : null;

        // Update modal content
        quickViewTitle.textContent = product.nome;
        quickViewProductName.textContent = product.nome;
        quickViewDescription.textContent = product.descricao;
        quickViewPrice.textContent = `R$ ${product.preco.toFixed(2)}`;

        // Set product image
        const category = productsData.categorias.find(cat =>
            cat.produtos.some(p => p.id === productId)
        );
        quickViewImage.src = getProductImageUrl(category.nome, product.nome);
        quickViewImage.alt = product.nome;

        // Update colors
        quickViewColors.innerHTML = '';
        if (product.cores && product.cores.length > 0) {
            product.cores.forEach((color, index) => {
                const colorBtn = document.createElement('button');
                colorBtn.className = `px-3 py-1 rounded-full text-xs border ${index === 0 ? 'bg-red-600 text-white border-red-600' : 'bg-white border-gray-300'}`;
                colorBtn.textContent = color;
                colorBtn.addEventListener('click', () => {
                    document.querySelectorAll('#quick-view-colors button').forEach(btn => {
                        btn.classList.remove('bg-red-600', 'text-white', 'border-red-600');
                        btn.classList.add('bg-white', 'border-gray-300');
                    });
                    colorBtn.classList.add('bg-red-600', 'text-white', 'border-red-600');
                    colorBtn.classList.remove('bg-white', 'border-gray-300');
                    currentColor = color;
                });
                quickViewColors.appendChild(colorBtn);
            });
        } else {
            quickViewColors.innerHTML = '<span class="text-gray-500">Nenhuma cor disponível</span>';
        }

        // Update sizes
        quickViewSizes.innerHTML = '';
        if (product.tamanhos && product.tamanhos.length > 0) {
            product.tamanhos.forEach((size, index) => {
                const sizeBtn = document.createElement('button');
                sizeBtn.className = `w-10 h-10 rounded-full flex items-center justify-center ${index === 0 ? 'bg-red-600 text-white border-red-600' : 'bg-white border border-gray-300'}`;
                sizeBtn.textContent = size;
                sizeBtn.addEventListener('click', () => {
                    document.querySelectorAll('#quick-view-sizes button').forEach(btn => {
                        btn.classList.remove('bg-red-600', 'text-white', 'border-red-600');
                        btn.classList.add('bg-white', 'border-gray-300');
                    });
                    sizeBtn.classList.add('bg-red-600', 'text-white', 'border-red-600');
                    sizeBtn.classList.remove('bg-white', 'border-gray-300');
                    currentSize = size;
                });
                quickViewSizes.appendChild(sizeBtn);
            });
        } else {
            quickViewSizes.innerHTML = '<span class="text-gray-500">Nenhum tamanho disponível</span>';
        }

        // Update quantity
        quantityElement.textContent = currentQuantity;

        // Show modal
        quickViewModal.classList.remove('hidden');
    }
}

// Add to cart from quick view
addToCartQuickView.addEventListener('click', () => {
    if (currentProduct) {
        addToCart(currentProduct.id, currentQuantity, currentColor, currentSize);
        quickViewModal.classList.add('hidden');
    }
});

// Add a product to cart
function addToCart(productId, quantity = 1, color = null, size = null) {
    // Find the product
    let product = null;
    for (const category of productsData.categorias) {
        product = category.produtos.find(p => p.id === productId);
        if (product) break;
    }

    if (product) {
        // Check if product is already in cart
        const existingItemIndex = cart.findIndex(item =>
            item.id === productId &&
            item.color === color &&
            item.size === size
        );

        if (existingItemIndex !== -1) {
            // Update quantity if product already in cart
            cart[existingItemIndex].quantity += quantity;
        } else {
            // Add new item to cart
            cart.push({
                id: product.id,
                name: product.nome,
                price: product.preco,
                quantity: quantity,
                color: color,
                size: size,
                image: getProductImageUrl(
                    productsData.categorias.find(cat =>
                        cat.produtos.some(p => p.id === productId)
                    ).nome,
                    product.nome
                )
            });
        }

        // Save to local storage
        localStorage.setItem('cart', JSON.stringify(cart));

        // Update cart count
        updateCartCount();

        // Show notification
        showToast(`${product.nome} adicionado ao carrinho!`);

        // If cart modal is open, update it
        if (!cartModal.classList.contains('hidden')) {
            renderCartItems();
        }
    }
}

// Render cart items
function renderCartItems() {
    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
        emptyCartMessage.classList.remove('hidden');
        checkoutButton.disabled = true;
        cartTotal.textContent = 'R$ 0,00';
        return;
    }

    emptyCartMessage.classList.add('hidden');
    checkoutButton.disabled = false;

    let total = 0;

    cart.forEach((item, index) => {
        total += item.price * item.quantity;

        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item flex py-4 border-b border-gray-200';

        cartItem.innerHTML = `
            <div class="w-20 h-20 rounded-md overflow-hidden mr-4">
                <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover">
            </div>
            <div class="flex-grow">
                <h4 class="font-bold">${item.name}</h4>
                <p class="text-sm text-gray-600">
                    ${item.color ? `Cor: ${item.color}` : ''}
                    ${item.size ? ` | Tamanho: ${item.size}` : ''}
                </p>
                <div class="flex justify-between items-center mt-2">
                    <div class="flex items-center border border-gray-300 rounded-md">
                        <button class="px-2 py-1 decrease-quantity" data-index="${index}">-</button>
                        <span class="px-2 py-1 border-x border-gray-300">${item.quantity}</span>
                        <button class="px-2 py-1 increase-quantity" data-index="${index}">+</button>
                    </div>
                    <span class="font-bold">R$ ${(item.price * item.quantity).toFixed(2)}</span>
                </div>
            </div>
            <button class="ml-4 text-gray-500 hover:text-red-600 remove-item" data-index="${index}">
                <i class="fas fa-times"></i>
            </button>
        `;

        cartItemsContainer.appendChild(cartItem);
    });

    // Add event listeners to quantity controls
    document.querySelectorAll('.decrease-quantity').forEach(button => {
        button.addEventListener('click', (e) => {
            const index = parseInt(e.currentTarget.dataset.index);
            updateCartItemQuantity(index, -1);
        });
    });

    document.querySelectorAll('.increase-quantity').forEach(button => {
        button.addEventListener('click', (e) => {
            const index = parseInt(e.currentTarget.dataset.index);
            updateCartItemQuantity(index, 1);
        });
    });

    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', (e) => {
            const index = parseInt(e.currentTarget.dataset.index);
            removeCartItem(index);
        });
    });

    // Update total
    cartTotal.textContent = `R$ ${total.toFixed(2)}`;
}

// Update cart item quantity
function updateCartItemQuantity(index, change) {
    if (index >= 0 && index < cart.length) {
        cart[index].quantity += change;

        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }

        // Save to local storage
        localStorage.setItem('cart', JSON.stringify(cart));

        // Update cart count
        updateCartCount();

        // Re-render cart items
        renderCartItems();
    }
}

// Remove item from cart
function removeCartItem(index) {
    if (index >= 0 && index < cart.length) {
        cart.splice(index, 1);

        // Save to local storage
        localStorage.setItem('cart', JSON.stringify(cart));

        // Update cart count
        updateCartCount();

        // Re-render cart items
        renderCartItems();
    }
}

// Update cart count badge
function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);

    if (count > 0) {
        cartCount.textContent = count;
        cartCount.classList.remove('hidden');
    } else {
        cartCount.classList.add('hidden');
    }
}

// Show toast notification
function showToast(message) {
    toastMessage.textContent = message;
    toastNotification.classList.remove('hidden');

    setTimeout(() => {
        toastNotification.classList.add('hidden');
    }, 3000);
}

// Checkout - generate WhatsApp message
checkoutButton.addEventListener('click', () => {
    if (cart.length === 0) return;

    let message = `Olá, gostaria de fazer um pedido na Teens Camp Shop:\n\n`;

    cart.forEach((item, index) => {
        message += `${index + 1}. ${item.name}`;
        if (item.color) message += ` (Cor: ${item.color})`;
        if (item.size) message += ` (Tamanho: ${item.size})`;
        message += ` - ${item.quantity}x R$ ${item.price.toFixed(2)} = R$ ${(item.price * item.quantity).toFixed(2)}\n`;
    });

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    message += `\nTotal: R$ ${total.toFixed(2)}`;

    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);

    // Open WhatsApp with the message
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
});
