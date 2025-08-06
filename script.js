let products = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];

const productsContainer = document.getElementById('products-container');
const cartBtn = document.getElementById('cart-btn');
const cartModal = document.getElementById('cart-modal');
const closeCart = document.getElementById('close-cart');
const cartItems = document.getElementById('cart-items');
const cartSubtotal = document.getElementById('cart-subtotal');
const cartCount = document.getElementById('cart-count');
const checkoutBtn = document.getElementById('checkout-btn');
const adminBtn = document.getElementById('admin-btn');
const adminLoginModal = document.getElementById('admin-login-modal');
const adminPanelModal = document.getElementById('admin-panel-modal');
const adminLoginForm = document.getElementById('admin-login-form');
const closeAdminPanel = document.getElementById('close-admin-panel');
const addProductForm = document.getElementById('add-product-form');
const adminProductsList = document.getElementById('admin-products-list');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

async function init() {
    try {
        const response = await fetch('./products.json');
        products = await response.json();
        
        displayProducts();
        updateCart();
    } catch (error) {
        console.error('Erro ao carregar os produtos:', error);
        productsContainer.innerHTML = '<p class="text-center text-red-500">Erro ao carregar os produtos. Por favor, tente novamente mais tarde.</p>';
    }
}

function displayProducts() {
    productsContainer.innerHTML = '';
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card bg-white rounded-lg overflow-hidden shadow-md transition duration-300';
        productCard.innerHTML = `
            <div class="h-64 overflow-hidden">
                <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover">
            </div>
            <div class="p-4">
                <h3 class="font-bold text-lg mb-2">${product.name}</h3>
                <p class="text-gray-600 text-sm mb-4">${product.description}</p>
                <div class="flex justify-between items-center">
                    <span class="font-bold text-red-800">R$ ${product.price.toFixed(2)}</span>
                    <button class="add-to-cart bg-red-800 text-white px-4 py-2 rounded-md hover:bg-red-900 transition" data-id="${product.id}">
                        Adicionar
                    </button>
                </div>
            </div>
        `;
        productsContainer.appendChild(productCard);
    });

    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = parseInt(e.target.getAttribute('data-id'));
            addToCart(productId);
        });
    });
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    updateCart();
    showCartNotification();
}

function showCartNotification() {
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-red-800 text-white px-4 py-2 rounded-md shadow-lg animate-bounce';
    notification.textContent = 'Produto adicionado ao carrinho!';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('opacity-0', 'transition', 'duration-500');
        setTimeout(() => notification.remove(), 500);
    }, 2000);
}

function updateCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    cartCount.classList.toggle('hidden', totalItems === 0);
    
    renderCartItems();
}

function renderCartItems() {
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="text-gray-500 text-center py-8">Seu carrinho está vazio</p>';
        cartSubtotal.textContent = 'R$ 0,00';
        checkoutBtn.disabled = true;
        return;
    }
    
    let subtotal = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'flex items-center py-4 border-b border-gray-200';
        cartItem.innerHTML = `
            <div class="w-16 h-16 bg-gray-100 rounded-md overflow-hidden mr-4">
                <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover">
            </div>
            <div class="flex-1">
                <h4 class="font-medium">${item.name}</h4>
                <p class="text-sm text-gray-600">R$ ${item.price.toFixed(2)}</p>
            </div>
            <div class="flex items-center">
                <button class="decrease-quantity text-gray-500 px-2 py-1" data-id="${item.id}">
                    <i class="fas fa-minus"></i>
                </button>
                <span class="mx-2">${item.quantity}</span>
                <button class="increase-quantity text-gray-500 px-2 py-1" data-id="${item.id}">
                    <i class="fas fa-plus"></i>
                </button>
                <button class="remove-item text-red-800 ml-4" data-id="${item.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        cartItems.appendChild(cartItem);
    });
    
    cartSubtotal.textContent = `R$ ${subtotal.toFixed(2)}`;
    checkoutBtn.disabled = false;
    
    document.querySelectorAll('.increase-quantity').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = parseInt(e.target.closest('button').getAttribute('data-id'));
            const item = cart.find(item => item.id === productId);
            if (item) item.quantity += 1;
            updateCart();
        });
    });
    
    document.querySelectorAll('.decrease-quantity').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = parseInt(e.target.closest('button').getAttribute('data-id'));
            const item = cart.find(item => item.id === productId);
            if (item) {
                item.quantity -= 1;
                if (item.quantity <= 0) {
                    cart = cart.filter(i => i.id !== productId);
                }
            }
            updateCart();
        });
    });
    
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = parseInt(e.target.closest('button').getAttribute('data-id'));
            cart = cart.filter(item => item.id !== productId);
            updateCart();
        });
    });
}

function checkout() {
    if (cart.length === 0) return;
    
    let message = "Olá, gostaria de fazer o pedido dos seguintes itens:\n\n";
    
    cart.forEach(item => {
        message += `- ${item.name} (${item.quantity}x) - R$ ${(item.price * item.quantity).toFixed(2)}\n`;
    });
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    message += `\nTotal: R$ ${subtotal.toFixed(2)}\n\n`;
    message += "Meu nome é: [NOME]\n";
    message += "Endereço para entrega: [ENDEREÇO]\n";
    message += "Forma de pagamento: [PAGAMENTO]";
    
    const encodedMessage = encodeURIComponent(message);
    
    window.open(`https://wa.me/5511999999999?text=${encodedMessage}`, '_blank');
    
    cart = [];
    updateCart();
    cartModal.classList.add('hidden');
}

function renderAdminProducts() {
    adminProductsList.innerHTML = '';
    
    products.forEach(product => {
        const productItem = document.createElement('div');
        productItem.className = 'bg-gray-100 p-4 rounded-md';
        productItem.innerHTML = `
            <div class="flex flex-col md:flex-row md:items-center md:justify-between">
                <div class="flex items-center mb-4 md:mb-0">
                    <div class="w-16 h-16 bg-gray-200 rounded-md overflow-hidden mr-4">
                        <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover">
                    </div>
                    <div>
                        <h4 class="font-bold">${product.name}</h4>
                        <p class="text-sm text-gray-600">R$ ${product.price.toFixed(2)}</p>
                    </div>
                </div>
                <div class="flex space-x-2">
                    <button class="edit-product bg-blue-600 text-white px-3 py-1 rounded-md text-sm" data-id="${product.id}">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="delete-product bg-red-800 text-white px-3 py-1 rounded-md text-sm" data-id="${product.id}">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                </div>
            </div>
        `;
        adminProductsList.appendChild(productItem);
    });
    
    document.querySelectorAll('.edit-product').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = parseInt(e.target.closest('button').getAttribute('data-id'));
            editProduct(productId);
        });
    });
    
    document.querySelectorAll('.delete-product').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = parseInt(e.target.closest('button').getAttribute('data-id'));
            if (confirm('Tem certeza que deseja excluir este produto?')) {
                deleteProduct(productId);
            }
        });
    });
}

function addProduct(e) {
    e.preventDefault();
    
    const newProduct = {
        id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
        name: document.getElementById('product-name').value,
        price: parseFloat(document.getElementById('product-price').value),
        image: document.getElementById('product-image').value,
        category: document.getElementById('product-category').value,
        description: document.getElementById('product-description').value
    };
    
    products.push(newProduct);
    displayProducts();
    renderAdminProducts();
    addProductForm.reset();
    
    alert('Produto adicionado com sucesso!');
}

function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-image').value = product.image;
    document.getElementById('product-category').value = product.category;
    document.getElementById('product-description').value = product.description;
    
    addProductForm.innerHTML += `
        <input type="hidden" id="edit-product-id" value="${product.id}">
        <div class="md:col-span-2 flex space-x-4">
            <button type="button" id="update-product" class="bg-green-600 text-white px-6 py-2 rounded-md font-bold hover:bg-green-700 transition">
                Atualizar
            </button>
            <button type="button" id="cancel-edit" class="bg-gray-600 text-white px-6 py-2 rounded-md font-bold hover:bg-gray-700 transition">
                Cancelar
            </button>
        </div>
    `;
    
    addProductForm.scrollIntoView({ behavior: 'smooth' });
    
    document.getElementById('update-product').addEventListener('click', () => {
        const updatedProduct = {
            id: productId,
            name: document.getElementById('product-name').value,
            price: parseFloat(document.getElementById('product-price').value),
            image: document.getElementById('product-image').value,
            category: document.getElementById('product-category').value,
            description: document.getElementById('product-description').value
        };
        
        const index = products.findIndex(p => p.id === productId);
        if (index !== -1) {
            products[index] = updatedProduct;
            displayProducts();
            renderAdminProducts();
            addProductForm.reset();
            
            document.getElementById('edit-product-id').remove();
            document.getElementById('update-product').remove();
            document.getElementById('cancel-edit').remove();
            
            alert('Produto atualizado com sucesso!');
        }
    });
    
    document.getElementById('cancel-edit').addEventListener('click', () => {
        addProductForm.reset();
        document.getElementById('edit-product-id').remove();
        document.getElementById('update-product').remove();
        document.getElementById('cancel-edit').remove();
    });
}

function deleteProduct(productId) {
    products = products.filter(p => p.id !== productId);
    displayProducts();
    renderAdminProducts();
    alert('Produto excluído com sucesso!');
}

document.addEventListener('DOMContentLoaded', init);

document.addEventListener('DOMContentLoaded', () => {
    displayProducts();
    updateCart();
    
    // Load Instagram feed (this would be replaced with actual Instagram API in production)
    // For demo purposes, we'll just show a placeholder
});

cartBtn.addEventListener('click', () => {
    cartModal.classList.remove('hidden');
});

closeCart.addEventListener('click', () => {
    cartModal.classList.add('hidden');
});

checkoutBtn.addEventListener('click', checkout);

adminBtn.addEventListener('click', () => {
    adminLoginModal.classList.remove('hidden');
});

adminLoginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username === 'Campineiro' && password === 'Setor_1.3') {
        adminLoginModal.classList.add('hidden');
        adminPanelModal.classList.remove('hidden');
        renderAdminProducts();
    } else {
        alert('Usuário ou senha incorretos!');
    }
});

closeAdminPanel.addEventListener('click', () => {
    adminPanelModal.classList.add('hidden');
});

addProductForm.addEventListener('submit', addProduct);

mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
});

window.addEventListener('click', (e) => {
    if (e.target === cartModal) {
        cartModal.classList.add('hidden');
    }
    
    if (e.target === adminLoginModal) {
        adminLoginModal.classList.add('hidden');
    }
    
    if (e.target === adminPanelModal) {
        adminPanelModal.classList.add('hidden');
    }
});