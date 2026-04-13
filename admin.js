// Admin password management
let ADMIN_PASSWORD = localStorage.getItem('admin_password') || 'admin123';

// Check login
document.getElementById('adminLoginForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const password = document.getElementById('adminPassword').value;
    if (password === ADMIN_PASSWORD) {
        localStorage.setItem('admin_logged_in', 'true');
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        loadDashboard();
        loadAllData();
    } else {
        alert('Wrong password!');
    }
});

// Auto login check
if (localStorage.getItem('admin_logged_in') === 'true') {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    loadDashboard();
    loadAllData();
}

function logoutAdmin() {
    localStorage.removeItem('admin_logged_in');
    location.reload();
}

function changeAdminPassword() {
    const newPass = document.getElementById('newAdminPassword').value;
    const confirmPass = document.getElementById('confirmAdminPassword').value;
    if (!newPass) { alert('Enter new password'); return; }
    if (newPass !== confirmPass) { alert('Passwords do not match'); return; }
    ADMIN_PASSWORD = newPass;
    localStorage.setItem('admin_password', newPass);
    alert('Password changed successfully! Please login again.');
    logoutAdmin();
}

function showAdminSection(section) {
    document.querySelectorAll('.admin-section').forEach(s => s.style.display = 'none');
    document.getElementById(`${section}Section`).style.display = 'block';
    let title = section.charAt(0).toUpperCase() + section.slice(1);
    if (section === 'adminSettings') title = 'Admin Settings';
    document.getElementById('sectionTitle').innerText = title;
    
    document.querySelectorAll('.admin-nav-btn').forEach(btn => btn.classList.remove('active'));
    if (event && event.target) {
        const btn = event.target.closest('.admin-nav-btn');
        if (btn) btn.classList.add('active');
    }
    
    if (section === 'products') loadProducts();
    if (section === 'categories') loadCategories();
    if (section === 'orders') loadOrders();
    if (section === 'users') loadUsers();
    if (section === 'slider') loadSliderImages();
    if (section === 'settings') loadSettings();
}

function loadAllData() {
    loadProducts();
    loadCategories();
    loadOrders();
    loadUsers();
    loadSliderImages();
    loadSettings();
}

function loadDashboard() {
    const products = JSON.parse(localStorage.getItem('lior_products') || '[]');
    const orders = JSON.parse(localStorage.getItem('lior_orders') || '[]');
    const users = JSON.parse(localStorage.getItem('lior_users') || '[]');
    
    document.getElementById('statProducts').innerText = products.filter(p => !p.hidden).length;
    document.getElementById('statOrders').innerText = orders.length;
    document.getElementById('statUsers').innerText = users.length;
    
    const revenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    document.getElementById('statRevenue').innerText = `LKR ${revenue.toLocaleString()}`;
    
    const recentOrders = orders.slice(0, 5);
    document.getElementById('recentOrdersTable').innerHTML = `
        <table class="w-full">
            <thead><tr class="border-b border-admin-border"><th class="p-3 text-left">Order ID</th><th class="p-3 text-left">Customer</th><th class="p-3 text-left">Total</th><th class="p-3 text-left">Status</th></tr></thead>
            <tbody>${recentOrders.map(o => `<tr><td class="p-3">${o.id}</td><td class="p-3">${o.customerName}</td><td class="p-3">LKR ${(o.total || 0).toLocaleString()}</td><td class="p-3"><span class="px-2 py-1 bg-yellow-500/20 text-yellow-500 rounded text-xs">${o.status}</span></td></tr>`).join('')}</tbody>
        </table>
    `;
}

// IMAGE UPLOAD - Using external image hosting recommendation
let currentImageUrl = null;

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        if (file.size > 5 * 1024 * 1024) {
            alert('Image too large! Max 5MB');
            return;
        }
        const reader = new FileReader();
        reader.onload = function(e) {
            currentImageUrl = e.target.result;
            document.getElementById('imagePreview').classList.remove('hidden');
            document.getElementById('previewImg').src = currentImageUrl;
        };
        reader.readAsDataURL(file);
    }
}

function removeImage() {
    currentImageUrl = null;
    document.getElementById('imagePreview').classList.add('hidden');
    document.getElementById('previewImg').src = '';
    document.getElementById('imageUploadInput').value = '';
}

// SLIDER IMAGE UPLOAD
let currentSliderImageUrl = null;

function handleSliderUpload(event) {
    const file = event.target.files[0];
    if (file) {
        if (file.size > 5 * 1024 * 1024) {
            alert('Image too large! Max 5MB');
            return;
        }
        const reader = new FileReader();
        reader.onload = function(e) {
            currentSliderImageUrl = e.target.result;
            document.getElementById('sliderPreview').classList.remove('hidden');
            document.getElementById('sliderPreviewImg').src = currentSliderImageUrl;
        };
        reader.readAsDataURL(file);
    }
}

// PRODUCTS with size-wise pricing AND DISCOUNT
function loadProducts() {
    const products = JSON.parse(localStorage.getItem('lior_products') || '[]');
    const visibleProducts = products.filter(p => !p.hidden);
    document.getElementById('productsTableBody').innerHTML = visibleProducts.map(p => {
        const sizePrices = p.sizePrices || {};
        const sizeDisplay = Object.entries(sizePrices).map(([size, price]) => `${size}: LKR ${price}`).join(', ');
        const discountDisplay = p.discountPrice ? `<span class="text-green-400 text-xs">Disc: LKR ${p.discountPrice}</span>` : '';
        return `
            <tr>
                <td class="p-4"><img src="${p.image}" class="w-12 h-12 object-cover rounded" onerror="this.src='https://placehold.co/50x50?text=No+Image'"></td>
                <td class="p-4">${p.name}<br>${discountDisplay}</td>
                <td class="p-4 text-sm">${sizeDisplay || `Base: LKR ${p.price}`}</td>
                <td class="p-4">${p.category}</td>
                <td class="p-4">${p.badge ? `<span class="px-2 py-1 bg-admin-accent/20 text-admin-accent rounded text-xs">${p.badge}</span>` : '-'}</td>
                <td class="p-4">
                    <button onclick="editProduct(${p.id})" class="edit-btn"><i class="fas fa-edit"></i> Edit</button>
                    <button onclick="deleteProduct(${p.id})" class="delete-btn"><i class="fas fa-trash"></i> Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

let editingProductId = null;

function openProductModal() {
    editingProductId = null;
    currentImageUrl = null;
    document.getElementById('productModalTitle').innerText = 'Add Product';
    document.getElementById('productName').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productDiscount').value = '';
    document.getElementById('productDescription').value = '';
    document.getElementById('productBadge').value = '';
    document.getElementById('sizeS').value = '';
    document.getElementById('sizeM').value = '';
    document.getElementById('sizeL').value = '';
    document.getElementById('sizeXL').value = '';
    document.getElementById('sizeXXL').value = '';
    document.getElementById('imagePreview').classList.add('hidden');
    document.getElementById('imageUploadInput').value = '';
    loadCategorySelect();
    document.getElementById('productModal').style.display = 'flex';
}

function editProduct(id) {
    const products = JSON.parse(localStorage.getItem('lior_products') || '[]');
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    editingProductId = id;
    document.getElementById('productModalTitle').innerText = 'Edit Product';
    document.getElementById('productName').value = product.name;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productDiscount').value = product.discountPrice || '';
    document.getElementById('productDescription').value = product.description || '';
    document.getElementById('productBadge').value = product.badge || '';
    
    const sizePrices = product.sizePrices || {};
    document.getElementById('sizeS').value = sizePrices.S || '';
    document.getElementById('sizeM').value = sizePrices.M || '';
    document.getElementById('sizeL').value = sizePrices.L || '';
    document.getElementById('sizeXL').value = sizePrices.XL || '';
    document.getElementById('sizeXXL').value = sizePrices.XXL || '';
    
    if (product.image && (product.image.startsWith('data:') || product.image.startsWith('http'))) {
        currentImageUrl = product.image;
        document.getElementById('imagePreview').classList.remove('hidden');
        document.getElementById('previewImg').src = product.image;
    }
    
    loadCategorySelect(product.category);
    document.getElementById('productModal').style.display = 'flex';
}

function loadCategorySelect(selected = null) {
    const categories = JSON.parse(localStorage.getItem('lior_categories') || '[]');
    const select = document.getElementById('productCategory');
    select.innerHTML = categories.map(c => `<option value="${c.key}" ${selected === c.key ? 'selected' : ''}>${c.name}</option>`).join('');
}

function saveProduct() {
    // Allow product without image (will show placeholder)
    const basePrice = parseInt(document.getElementById('productPrice').value);
    const discountPrice = document.getElementById('productDiscount').value ? parseInt(document.getElementById('productDiscount').value) : null;
    
    if (!document.getElementById('productName').value) {
        alert('Please enter product name!');
        return;
    }
    if (!basePrice) {
        alert('Please enter product price!');
        return;
    }
    
    const products = JSON.parse(localStorage.getItem('lior_products') || '[]');
    
    const sizePrices = {
        S: parseInt(document.getElementById('sizeS').value) || basePrice,
        M: parseInt(document.getElementById('sizeM').value) || basePrice,
        L: parseInt(document.getElementById('sizeL').value) || basePrice,
        XL: parseInt(document.getElementById('sizeXL').value) || basePrice,
        XXL: parseInt(document.getElementById('sizeXXL').value) || basePrice + 300
    };
    
    // Use default image if no image uploaded
    let productImage = currentImageUrl;
    if (!productImage) {
        productImage = 'https://placehold.co/600x400?text=No+Image';
    }
    
    const productData = {
        id: editingProductId || Date.now(),
        name: document.getElementById('productName').value,
        price: basePrice,
        discountPrice: discountPrice,
        image: productImage,
        category: document.getElementById('productCategory').value,
        badge: document.getElementById('productBadge').value || null,
        description: document.getElementById('productDescription').value,
        hidden: false,
        sizePrices: sizePrices
    };
    
    if (editingProductId) {
        const index = products.findIndex(p => p.id === editingProductId);
        products[index] = { ...products[index], ...productData };
    } else {
        products.push(productData);
    }
    
    localStorage.setItem('lior_products', JSON.stringify(products));
    closeModal('productModal');
    loadProducts();
    showToast('Product saved!');
}

function deleteProduct(id) {
    if (confirm('Delete this product permanently?')) {
        let products = JSON.parse(localStorage.getItem('lior_products') || '[]');
        products = products.filter(p => p.id !== id);
        localStorage.setItem('lior_products', JSON.stringify(products));
        loadProducts();
        showToast('Product deleted!');
    }
}

// CATEGORIES with Edit
function loadCategories() {
    const categories = JSON.parse(localStorage.getItem('lior_categories') || '[]');
    document.getElementById('categoriesList').innerHTML = categories.map(c => `
        <div class="bg-admin-card p-4 rounded-lg border border-admin-border">
            <h3 class="font-bold">${c.name}</h3>
            <p class="text-gray-400 text-sm mb-3">${c.key}</p>
            <div class="flex gap-2">
                <button onclick="editCategory('${c.key}')" class="edit-btn text-sm"><i class="fas fa-edit"></i> Edit</button>
                <button onclick="deleteCategory('${c.key}')" class="delete-btn text-sm"><i class="fas fa-trash"></i> Delete</button>
            </div>
        </div>
    `).join('');
}

let editingCategoryKey = null;

function openCategoryModal() {
    editingCategoryKey = null;
    document.getElementById('categoryModalTitle').innerText = 'Add Category';
    document.getElementById('categoryName').value = '';
    document.getElementById('categoryKey').value = '';
    document.getElementById('categoryModal').style.display = 'flex';
}

function editCategory(key) {
    const categories = JSON.parse(localStorage.getItem('lior_categories') || '[]');
    const category = categories.find(c => c.key === key);
    if (category) {
        editingCategoryKey = key;
        document.getElementById('categoryModalTitle').innerText = 'Edit Category';
        document.getElementById('categoryName').value = category.name;
        document.getElementById('categoryKey').value = category.key;
        document.getElementById('categoryModal').style.display = 'flex';
    }
}

function saveCategory() {
    let categories = JSON.parse(localStorage.getItem('lior_categories') || '[]');
    const categoryData = {
        id: Date.now(),
        name: document.getElementById('categoryName').value,
        key: document.getElementById('categoryKey').value
    };
    
    if (editingCategoryKey) {
        const index = categories.findIndex(c => c.key === editingCategoryKey);
        categories[index] = categoryData;
        let products = JSON.parse(localStorage.getItem('lior_products') || '[]');
        products.forEach(p => {
            if (p.category === editingCategoryKey) p.category = categoryData.key;
        });
        localStorage.setItem('lior_products', JSON.stringify(products));
    } else {
        categories.push(categoryData);
    }
    
    localStorage.setItem('lior_categories', JSON.stringify(categories));
    closeModal('categoryModal');
    loadCategories();
    showToast('Category saved!');
}

function deleteCategory(key) {
    if (confirm('Delete this category?')) {
        let categories = JSON.parse(localStorage.getItem('lior_categories') || '[]');
        categories = categories.filter(c => c.key !== key);
        localStorage.setItem('lior_categories', JSON.stringify(categories));
        loadCategories();
        showToast('Category deleted!');
    }
}

// ORDERS with Delete
function loadOrders() {
    const orders = JSON.parse(localStorage.getItem('lior_orders') || '[]');
    document.getElementById('ordersTableBody').innerHTML = orders.map(o => `
        <tr>
            <td class="p-4">${o.id}</td>
            <td class="p-4">${o.date}</td>
            <td class="p-4">${o.customerName}<br><small class="text-gray-500">${o.customerEmail}</small></td>
            <td class="p-4">LKR ${(o.total || 0).toLocaleString()}</td>
            <td class="p-4">
                <select onchange="updateOrderStatus('${o.id}', this.value)" class="px-2 py-1 bg-admin-dark border border-admin-border rounded text-sm">
                    <option ${o.status === 'Pending' ? 'selected' : ''}>Pending</option>
                    <option ${o.status === 'Processing' ? 'selected' : ''}>Processing</option>
                    <option ${o.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                    <option ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                    <option ${o.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
            </td>
            <td class="p-4">
                <button onclick="viewOrderDetails('${o.id}')" class="view-btn"><i class="fas fa-eye"></i> View</button>
                <button onclick="deleteOrder('${o.id}')" class="delete-btn"><i class="fas fa-trash"></i> Delete</button>
            </td>
        </tr>
    `).join('');
}

function updateOrderStatus(orderId, status) {
    const orders = JSON.parse(localStorage.getItem('lior_orders') || '[]');
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.status = status;
        localStorage.setItem('lior_orders', JSON.stringify(orders));
        showToast('Order status updated!');
    }
}

function deleteOrder(orderId) {
    if (confirm('Delete this order permanently?')) {
        let orders = JSON.parse(localStorage.getItem('lior_orders') || '[]');
        orders = orders.filter(o => o.id !== orderId);
        localStorage.setItem('lior_orders', JSON.stringify(orders));
        loadOrders();
        loadDashboard();
        showToast('Order deleted!');
    }
}

function viewOrderDetails(orderId) {
    const orders = JSON.parse(localStorage.getItem('lior_orders') || '[]');
    const order = orders.find(o => o.id === orderId);
    if (order) {
        let itemsList = '';
        if (order.items) {
            itemsList = order.items.map(item => `- ${item.name} (x${item.quantity}) - LKR ${(item.price * item.quantity).toLocaleString()}`).join('\n');
        }
        alert(`Order: ${order.id}\nDate: ${order.date}\nCustomer: ${order.customerName}\nEmail: ${order.customerEmail}\nPhone: ${order.phone || 'N/A'}\nAddress: ${order.address || 'N/A'}\n\nItems:\n${itemsList}\n\nTotal: LKR ${(order.total || 0).toLocaleString()}\nStatus: ${order.status}`);
    }
}

// USERS with Add/Edit
function loadUsers() {
    const users = JSON.parse(localStorage.getItem('lior_users') || '[]');
    document.getElementById('usersTableBody').innerHTML = users.map(u => `
        <tr>
            <td class="p-4">${u.id}</td>
            <td class="p-4">${u.name}</td>
            <td class="p-4">${u.email}</td>
            <td class="p-4">${u.phone || '-'}</td>
            <td class="p-4">${u.address || '-'}</td>
            <td class="p-4">
                <button onclick="editUser(${u.id})" class="edit-btn"><i class="fas fa-edit"></i> Edit</button>
                <button onclick="deleteUser(${u.id})" class="delete-btn"><i class="fas fa-trash"></i> Delete</button>
            </td>
        </tr>
    `).join('');
}

let editingUserId = null;

function openUserModal() {
    editingUserId = null;
    document.getElementById('userModalTitle').innerText = 'Add User';
    document.getElementById('userName').value = '';
    document.getElementById('userEmail').value = '';
    document.getElementById('userPassword').value = '';
    document.getElementById('userPhone').value = '';
    document.getElementById('userAddress').value = '';
    document.getElementById('userModal').style.display = 'flex';
}

function editUser(id) {
    const users = JSON.parse(localStorage.getItem('lior_users') || '[]');
    const user = users.find(u => u.id === id);
    if (user) {
        editingUserId = id;
        document.getElementById('userModalTitle').innerText = 'Edit User';
        document.getElementById('userName').value = user.name;
        document.getElementById('userEmail').value = user.email;
        document.getElementById('userPassword').value = '';
        document.getElementById('userPhone').value = user.phone || '';
        document.getElementById('userAddress').value = user.address || '';
        document.getElementById('userModal').style.display = 'flex';
    }
}

function saveUser() {
    let users = JSON.parse(localStorage.getItem('lior_users') || '[]');
    const password = document.getElementById('userPassword').value;
    
    const userData = {
        id: editingUserId || Date.now(),
        name: document.getElementById('userName').value,
        email: document.getElementById('userEmail').value,
        phone: document.getElementById('userPhone').value,
        address: document.getElementById('userAddress').value
    };
    
    if (editingUserId) {
        const index = users.findIndex(u => u.id === editingUserId);
        if (password) userData.password = password;
        else userData.password = users[index].password;
        users[index] = { ...users[index], ...userData };
    } else {
        if (!password) { alert('Password required for new user'); return; }
        userData.password = password;
        if (users.find(u => u.email === userData.email)) { alert('Email already exists'); return; }
        users.push(userData);
    }
    
    localStorage.setItem('lior_users', JSON.stringify(users));
    closeModal('userModal');
    loadUsers();
    showToast('User saved!');
}

function deleteUser(id) {
    if (confirm('Delete this user?')) {
        let users = JSON.parse(localStorage.getItem('lior_users') || '[]');
        users = users.filter(u => u.id !== id);
        localStorage.setItem('lior_users', JSON.stringify(users));
        loadUsers();
        showToast('User deleted!');
    }
}

// SLIDER with Image Upload Only
function loadSliderImages() {
    let images = JSON.parse(localStorage.getItem('lior_slider_images') || '[]');
    if (images.length === 0) {
        // Default images using placeholders
        images = [
            'https://placehold.co/2000x800/1a1a20/c9a962?text=LIOR+CEYLON+1',
            'https://placehold.co/2000x800/1a1a20/c9a962?text=LIOR+CEYLON+2'
        ];
        localStorage.setItem('lior_slider_images', JSON.stringify(images));
    }
    
    document.getElementById('sliderImagesList').innerHTML = images.map((img, idx) => `
        <div class="bg-admin-card rounded-lg border border-admin-border overflow-hidden">
            <img src="${img}" class="w-full h-48 object-cover" onerror="this.src='https://placehold.co/300x200?text=Image+Error'">
            <div class="p-4">
                <button onclick="deleteSliderImage(${idx})" class="delete-btn w-full"><i class="fas fa-trash"></i> Remove</button>
            </div>
        </div>
    `).join('');
}

function openSliderModal() {
    currentSliderImageUrl = null;
    document.getElementById('sliderPreview').classList.add('hidden');
    document.getElementById('sliderUploadInput').value = '';
    document.getElementById('sliderModal').style.display = 'flex';
}

function addSliderImage() {
    if (!currentSliderImageUrl) {
        alert('Please upload an image first!');
        return;
    }
    
    let images = JSON.parse(localStorage.getItem('lior_slider_images') || '[]');
    images.push(currentSliderImageUrl);
    localStorage.setItem('lior_slider_images', JSON.stringify(images));
    closeModal('sliderModal');
    loadSliderImages();
    showToast('Slider image added!');
}

function deleteSliderImage(index) {
    if (confirm('Remove this slider image?')) {
        let images = JSON.parse(localStorage.getItem('lior_slider_images') || '[]');
        images.splice(index, 1);
        localStorage.setItem('lior_slider_images', JSON.stringify(images));
        loadSliderImages();
        showToast('Image removed!');
    }
}

// SETTINGS with Tax - FIXED
function loadSettings() {
    document.getElementById('settingStoreName').value = localStorage.getItem('store_name') || 'LIOR CEYLON';
    document.getElementById('settingAddress').value = localStorage.getItem('contact_address') || 'Colombo 03, Sri Lanka';
    document.getElementById('settingPhone').value = localStorage.getItem('contact_phone') || '+94 77 123 4567';
    document.getElementById('settingEmail').value = localStorage.getItem('contact_email') || 'hello@liorceylon.lk';
    document.getElementById('settingShippingFee').value = localStorage.getItem('shipping_fee') || '500';
    document.getElementById('settingTaxRate').value = localStorage.getItem('tax_rate') || '8';
    document.getElementById('settingFacebook').value = localStorage.getItem('social_facebook') || '';
    document.getElementById('settingInstagram').value = localStorage.getItem('social_instagram') || '';
    document.getElementById('settingTiktok').value = localStorage.getItem('social_tiktok') || '';
    document.getElementById('settingWhatsapp').value = localStorage.getItem('social_whatsapp') || '';
    document.getElementById('settingCopyright').value = localStorage.getItem('footer_copyright') || '© 2026 LIOR CEYLON. All rights reserved. Sri Lanka';
}

function saveSettings() {
    localStorage.setItem('store_name', document.getElementById('settingStoreName').value);
    localStorage.setItem('contact_address', document.getElementById('settingAddress').value);
    localStorage.setItem('contact_phone', document.getElementById('settingPhone').value);
    localStorage.setItem('contact_email', document.getElementById('settingEmail').value);
    localStorage.setItem('shipping_fee', document.getElementById('settingShippingFee').value);
    localStorage.setItem('tax_rate', document.getElementById('settingTaxRate').value);
    localStorage.setItem('social_facebook', document.getElementById('settingFacebook').value);
    localStorage.setItem('social_instagram', document.getElementById('settingInstagram').value);
    localStorage.setItem('social_tiktok', document.getElementById('settingTiktok').value);
    localStorage.setItem('social_whatsapp', document.getElementById('settingWhatsapp').value);
    localStorage.setItem('footer_copyright', document.getElementById('settingCopyright').value);
    showToast('All settings saved!');
    
    // Update the tax rate display on customer site
    if (typeof updateTaxRate === 'function') {
        updateTaxRate();
    }
}

// Helper functions
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-admin-accent text-black px-6 py-3 rounded-lg font-bold z-50';
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

window.onclick = (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
};