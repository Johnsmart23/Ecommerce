let iconCart = document.querySelector('.icon-cart');
let closeCart = document.querySelector('.close');
let body = document.querySelector('body');
let listProductHTML = document.querySelector('.listProduct');
let listCartHTML = document.querySelector('.listCart');
let iconCartSpan = document.querySelector('.icon-cart span');

let listProducts = [];
let carts = []; 

// Transaction fee constant
const TRANSACTION_FEE = 5;

iconCart.addEventListener('click', () => {
    body.classList.toggle('showCart');
});

closeCart.addEventListener('click', () => {
    body.classList.toggle('showCart');
});

const addDataToHTML = () => {
    listProductHTML.innerHTML = ''; 
    if (listProducts.length > 0) {
        listProducts.forEach(product => {
            let newProduct = document.createElement('div');
            newProduct.classList.add('item');
            newProduct.dataset.id = product.id;
            newProduct.innerHTML = `
              <img src="${product.image}" alt="">
              <h2>${product.name}</h2>
              <div class="price">$${product.price}</div>
              <button class="addCart">
              Add To Cart
              </button>
            `;
            listProductHTML.appendChild(newProduct);
        });
    }
};

let checkOutButton = document.querySelector('.checkOut');
checkOutButton.addEventListener('click', () => {
    // Show the final checkout summary
    displayCheckoutSummary();
});

const displayCheckoutSummary = () => {
    let totalAmount = calculateTotal(carts.reduce((total, cart) => total + cart.price * cart.quantity, 0));

    // Display a summary of the cart items for checkout
    let checkoutSummary = `
        <h2>Checkout Summary</h2>
        <div class="checkout-details">
            <p>Items in Cart: ${carts.length}</p>
            <p>Transaction Fee: $${TRANSACTION_FEE}</p>
            <p>Total Amount: $${totalAmount.toFixed(2)}</p>
        </div>
        <div class="checkout-actions">
            <button class="confirm-checkout">Confirm Checkout</button>
            <button class="cancel-checkout">Cancel</button>
        </div>
    `;
    let checkoutModal = document.createElement('div');
    checkoutModal.classList.add('checkout-modal');
    checkoutModal.innerHTML = checkoutSummary;
    document.body.appendChild(checkoutModal);

    // Confirm Checkout
    let confirmCheckoutButton = checkoutModal.querySelector('.confirm-checkout');
    confirmCheckoutButton.addEventListener('click', () => {
        alert("Checkout Successful! Your order has been placed.");
        carts = []; 
        addCartToHTML(); 
        localStorage.removeItem('cart'); 
        document.body.removeChild(checkoutModal); 
    });

    // Cancel Checkout
    let cancelCheckoutButton = checkoutModal.querySelector('.cancel-checkout');
    cancelCheckoutButton.addEventListener('click', () => {
        document.body.removeChild(checkoutModal); 
    });
};

listProductHTML.addEventListener('click', (event) => {
    let positionClick = event.target;
    if (positionClick.classList.contains('addCart')) {
        let product_id = positionClick.parentElement.dataset.id;
        addToCart(product_id);
    }
});

const addToCart = (product_id) => {
    let positionThisProductInCart = carts.findIndex((value) => value.product_id == product_id);
    if (positionThisProductInCart < 0) {
        let product = listProducts.find((p) => p.id == product_id);
        carts.push({
            product_id: product.id,
            quantity: 1,
            name: product.name,
            price: product.price,
            image: product.image
        });
    } else {
        carts[positionThisProductInCart].quantity += 1;
    }
    addCartToHTML();
    addCartToMemory();
};

const addCartToMemory = () => {
    localStorage.setItem('cart', JSON.stringify(carts)); 
}

const addCartToHTML = () => {
    listCartHTML.innerHTML = '';
    let totalQuantity = 0;
    let subtotal = 0; 

    if (carts.length > 0) {
        carts.forEach(cart => {
            totalQuantity += cart.quantity;
            subtotal += cart.price * cart.quantity; 

            let newCart = document.createElement('div');
            newCart.classList.add('item');
            newCart.dataset.id = cart.product_id;
            newCart.innerHTML = `
                <div class="image">
                    <img src="${cart.image}" alt=""/>
                </div>
                <div class="name">${cart.name}</div>
                <div class="totalPrice">$${cart.price * cart.quantity}</div>
                <div class="quantity">
                    <span class="minus"><</span>
                    <span>${cart.quantity}</span>
                    <span class="plus">></span>
                </div>
            `;
            listCartHTML.appendChild(newCart);
        });
    }

    iconCartSpan.innerText = totalQuantity;

    // Display the subtotal and total amount
    const totalAmount = calculateTotal(subtotal);

    // Add the subtotal and total amount to the cart view
    const summary = document.createElement('div');
    summary.classList.add('summary');
    summary.innerHTML = `
        <div class="subtotal">Subtotal: $${subtotal.toFixed(2)}</div>
        <div class="transaction-fee">Transaction Fee: $${TRANSACTION_FEE}</div>
        <div class="total">Total: $${totalAmount.toFixed(2)}</div>
    `;
    listCartHTML.appendChild(summary);
};

// Event listener for plus and minus buttons
listCartHTML.addEventListener('click', (event) => {
    let positionClick = event.target;
    if (positionClick.classList.contains('minus') || positionClick.classList.contains('plus')) {
        let product_id = positionClick.closest('.item').dataset.id; 
        let type = positionClick.classList.contains('plus') ? 'plus' : 'minus'; 
        changeQuantity(product_id, type); 
    }
});

// Function to update quantity
const changeQuantity = (product_id, type) => {
    let positionItemInCart = carts.findIndex((value) => value.product_id == product_id);
    if (positionItemInCart >= 0) {
        if (type === 'plus') {
            carts[positionItemInCart].quantity += 1; 
        } else {
            if (carts[positionItemInCart].quantity > 1) {
                carts[positionItemInCart].quantity -= 1; 
            } else {
                carts.splice(positionItemInCart, 1); 
            }
        }
    }
    addCartToMemory();
    addCartToHTML();
}

// Function to calculate total amount (subtotal + transaction fee)
const calculateTotal = (subtotal) => {
    return subtotal + TRANSACTION_FEE;
}

const initApp = () => {
    // Get data from the JSON file
    fetch('products.json')
    .then(response => response.json())
    .then(data => {
        listProducts = data;
        addDataToHTML();
        
        // Get the cart from localStorage
        if (localStorage.getItem('cart')) {
            carts = JSON.parse(localStorage.getItem('cart')); 
            addCartToHTML(); 
        }
    });
};

initApp();
