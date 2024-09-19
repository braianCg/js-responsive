const cart = [];  
let total = 0;  

document.addEventListener('DOMContentLoaded', loadProducts);  

document.getElementById('clear-cart').addEventListener('click', clearCart);  
document.getElementById('toggle-cart').addEventListener('click', toggleCart);  
document.getElementById('close-cart').addEventListener('click', toggleCart);  
document.getElementById('pay-button').addEventListener('click', handlePayment);  

async function loadProducts() {  
    try {  
        const response = await fetch('/api/products');  
        if (!response.ok) throw new Error('Error loading products');  
        const products = await response.json();  
        if (!Array.isArray(products)) throw new Error('Loaded products are not a valid list');  
        displayProducts(products);  
        loadCartFromLocalStorage();  
    } catch (error) {  
        console.error('Error fetching products:', error);  
    }  
}  

function displayProducts(products) {  
    const productList = document.getElementById('product-list');  
    productList.innerHTML = '';  

    products.forEach(product => {  
        if (validateProduct(product)) {  
            const productElement = document.createElement('div');  
            productElement.classList.add('border', 'p-4', 'bg-white', 'rounded');  
            productElement.innerHTML = `  
                <img src="${product.image}" alt="${product.name}" class="max-w-full h-auto">  
                <h3>${product.name}</h3>  
                <p>${product.description || 'No description'}</p>  
                <p>Price: $${parseFloat(product.price).toFixed(2)}</p>  
                <button onclick="addToCart('${product.name}', ${parseFloat(product.price)})" class="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded">Add to Cart</button>  
            `;  
            productList.appendChild(productElement);  
        } else {  
            console.warn('Invalid or incomplete product', product);  
        }  
    });  
}  

function validateProduct(product) {  
    return product && typeof product.name === 'string' && product.name.trim() !== '' &&  
           typeof product.price === 'number' && product.price > 0 &&  
           typeof product.image === 'string' && product.image.trim() !== '';  
}  

function loadCartFromLocalStorage() {  
    const storedCart = JSON.parse(localStorage.getItem('cart')) || [];  
    if (Array.isArray(storedCart)) {  
        storedCart.forEach(item => {  
            if (validateCartItem(item)) { 
                cart.push(item);  
                total += item.price * item.quantity;  
            } else {  
                console.warn('Invalid cart item', item);  
            }  
        });  
    }  
    updateCartDisplay();  
}  

function validateCartItem(item) {  
    return item && typeof item.name === 'string' && item.name.trim() !== '' &&  
           typeof item.price === 'number' && item.price > 0 &&  
           typeof item.quantity === 'number' && item.quantity > 0;  
}  

function addToCart(productName, productPrice) {  
    const existingItem = cart.find(item => item.name === productName);  
    if (existingItem) {  
        existingItem.quantity += 1;  
    } else {  
        cart.push({ name: productName, price: productPrice, quantity: 1 });  
    }  
    total += productPrice;  
    localStorage.setItem('cart', JSON.stringify(cart));  
    updateCartDisplay();  
}  

function increaseQuantity(productName) {  
    const existingItem = cart.find(item => item.name === productName);  
    if (existingItem) {  
        existingItem.quantity += 1;  
        total += existingItem.price;  
        localStorage.setItem('cart', JSON.stringify(cart));  
        updateCartDisplay();  
    }  
}  

function decreaseQuantity(productName) {  
    const existingItem = cart.find(item => item.name === productName);  
    if (existingItem) {  
        if (existingItem.quantity > 1) {  
            existingItem.quantity -= 1;  
            total -= existingItem.price;  
            localStorage.setItem('cart', JSON.stringify(cart));  
            updateCartDisplay();  
        } else {  
            removeFromCart(productName);  
        }  
    }  
}  

function removeFromCart(productName) {  
    const existingItem = cart.find(item => item.name === productName);  
    if (existingItem) {  
        total -= existingItem.price * existingItem.quantity;  
        cart.splice(cart.indexOf(existingItem), 1);  
        localStorage.setItem('cart', JSON.stringify(cart));  
        updateCartDisplay();  
    }  
}  

function clearCart() {  
    cart.length = 0;  
    total = 0;  
    localStorage.removeItem('cart');  
    updateCartDisplay();  
}  

function updateCartDisplay() {  
    const cartItems = document.getElementById('cart-items');  
    const totalElement = document.getElementById('total');  
    cartItems.innerHTML = '';  

    cart.forEach(item => {  
        const li = document.createElement('li');  
        li.textContent = `${item.name} - $${item.price.toFixed(2)} x ${item.quantity}`;  
        
        const increaseButton = document.createElement('button');  
        increaseButton.textContent = '+';  
        increaseButton.classList.add('bg-green-500', 'hover:bg-green-700', 'text-white', 'ml-2', 'py-1', 'px-2', 'rounded');  
        increaseButton.onclick = () => increaseQuantity(item.name);  
        
        const decreaseButton = document.createElement('button');  
        decreaseButton.textContent = '-';  
        decreaseButton.classList.add('bg-red-500', 'hover:bg-red-700', 'text-white', 'ml-2', 'py-1', 'px-2', 'rounded');  
        decreaseButton.onclick = () => decreaseQuantity(item.name);  
        
        li.appendChild(increaseButton);  
        li.appendChild(decreaseButton);  
        cartItems.appendChild(li);  
    });  
    totalElement.textContent = `Total: $${total.toFixed(2)}`;  
}  

function toggleCart() {  
    const cartModal = document.getElementById('cart');  
    cartModal.classList.toggle('hidden');  
}  

function handlePayment() {  
    if (cart.length === 0) {  
        Swal.fire({  
            icon: 'warning',  
            title: 'Empty Cart',  
            text: 'There are no products in the cart to pay for.',  
        });  
        return;  
    }  

    Swal.fire({  
        icon: 'success',  
        title: 'Thank you for your purchase!',  
        text: 'Your order has been successfully processed.',  
    });  

    clearCart();  
}  

function clearLocalStorage() {  
    localStorage.clear();  
}