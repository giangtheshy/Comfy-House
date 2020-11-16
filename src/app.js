const client = contentful.createClient({
    // This is the space ID. A space is like a project folder in Contentful terms
    space: "wm2mwt8l1cvz",
    // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
    accessToken: "SgN2BZEuYKosaL27cxEP1GotZsugvIuYZ8spL_vXpAs"
});


const cartBtn = document.querySelector('.cart-btn');
const cartItems = document.querySelector('.cart-items');

const productsSection = document.getElementById("our-product");
const productsContainer = document.querySelector('.products-container');

const sideBarBtn = document.querySelector('.bar-icon');
const sideBar = document.querySelector(".side-bar");
const closeSideBarBtn = document.querySelector('.close-sidebar-btn');
const searchBox = document.getElementById('search-box');
const rangePrice = document.getElementById('range-price');
const rangeValue = document.querySelector('.value-price-range');



const cartOverlay = document.querySelector('.cart-overlay');
const cartContainer = document.querySelector('.cart-container');
const closeCartBtn = document.querySelector('.close-cart-btn');
const cartProducts = document.querySelector('.cart-products');
const shopping = document.getElementById("shopping");

const cartTotal = document.querySelector(".cart-total");
const clearCart = document.querySelector(".clear-cart");

let cart = [];
let buttonsDOM = [];
let flag = false;

class Products {
    async getProducts() {
        try {
            let contentful = await client.getEntries({
                content_type: "comfyHouse"
            });

            let products = contentful.items;
            products = products.map(item => {
                const {
                    title,
                    price
                } = item.fields;
                const {
                    id
                } = item.sys;
                const image = item.fields.image.fields.file.url;
                return {
                    title,
                    price,
                    id,
                    image
                };
            });
            return products;
        } catch (error) {
            console.log(error);
        }
    }
}

class UI {
    displayProducts(products) {
        let result = "";
        products.forEach(product => {
            result += `<div class="product">
            <div class="product-img">
                <img class="img-product"  src=${product.image} alt=${product.title}>
                <button class="add-to-cart" data-id=${product.id}><i class="fas fa-shopping-cart"></i> Add to Bag</button>
            </div>
            <div class="product-desc">
                <p class="product-title">${product.title}</p>
                <p class="product-price">$ ${product.price}</p>
            </div>
        </div>`
        });
        productsContainer.innerHTML = result;
    }
    getBagButtons() {

        let buttons = [...document.querySelectorAll(".add-to-cart")];
        buttonsDOM = buttons;
        buttons.forEach(button => {

            let id = button.dataset.id;
            let inCart = cart.find(item => item.id === id);
            if (inCart) {
                button.innerHTML = "In Cart";
                button.disabled = true;
            }

            button.addEventListener("click", e => {
                e.target.children[0].disabled = true;
                e.target.innerHTML = "In Cart";
                e.target.disabled = true;

                let cartItem = {
                    ...Storage.getProduct(id),
                    amount: 1
                };
                cart = [...cart, cartItem];

                Storage.saveCart(cart);
                this.setCartValue(cart);
                this.addCartItem(cartItem);
                this.showCart();
            })
        })

    }
    setCartValue(cart) {
        let tempTotal = 0;
        let itemTotal = 0;
        cart.map(item => {
            tempTotal += item.amount * item.price;
            itemTotal += item.amount;
        })

        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemTotal;
    }
    addCartItem(cartItem) {
        const div = document.createElement('div');
        div.classList.add('cart-product');
        div.innerHTML = `<div class="cart-product-content">
        <img src=${cartItem.image} alt=${cartItem.title}>
        <div class="cart-product-desc">
            <p class="cart-product-title">${cartItem.title}</p>
            <p class="cart-product-price">$${cartItem.price}</p>
            <button class="remove-cart-product" data-id=${cartItem.id}>remove</button>
        </div>
    </div>
    <div class="cart-product-amount">
        <span class="increase-amount-product"  data-id=${cartItem.id}><i class="fas fa-chevron-up"></i></span>
        <div class="amount-product">${cartItem.amount}</div>
        <span class="decrease-amount-product"  data-id=${cartItem.id}><i class="fas fa-chevron-down"></i></span>
    </div>`
        cartProducts.appendChild(div);
    }
    showCart() {
        cartOverlay.classList.add("visible-cart-overlay");
        cartContainer.classList.add("show-cart");
    }
    setUpApp() {

        cart = Storage.getCart();

        this.setCartValue(cart);
        this.popularCart(cart);
        cartBtn.addEventListener("click", this.showCart);
        closeCartBtn.addEventListener("click", this.hideCart);
    }
    hideCart() {
        cartOverlay.classList.remove("visible-cart-overlay");
        cartContainer.classList.remove("show-cart");
    }
    popularCart(cart) {
        cart.forEach(item => {
            this.addCartItem(item);
        })
    }
    cartLogic() {
        clearCart.addEventListener("click", () => {
            this.clearCartBtn()
        });
        if (flag === true) {
            return;
        } else {
            flag = true;
            cartProducts.addEventListener("click", e => {
                if (e.target.classList.contains("remove-cart-product")) {
                    let removeItem = e.target;
                    cartProducts.removeChild(removeItem.parentElement.parentElement.parentElement);
                    let id = removeItem.dataset.id;
                    this.removeItem(id);
                    if (cart.length === 0) {
                        this.hideCart();
                    }

                } else if (e.target.classList.contains("fa-chevron-up")) {
                    let addAmount = e.target.parentElement;
                    let id = addAmount.dataset.id;
                    let tempItem = cart.find(item => item.id === id);

                    tempItem.amount += 1;
                    Storage.saveCart(cart);
                    this.setCartValue(cart);
                    addAmount.nextElementSibling.innerText = tempItem.amount;

                } else if (e.target.classList.contains("fa-chevron-down")) {
                    let minusAmount = e.target.parentElement;
                    let id = minusAmount.dataset.id;
                    let tempItem = cart.find(item => item.id === id);

                    tempItem.amount -= 1;
                    if (tempItem.amount > 0) {
                        Storage.saveCart(cart);
                        this.setCartValue(cart);
                        minusAmount.previousElementSibling.innerText = tempItem.amount;
                    } else {

                        cartProducts.removeChild(minusAmount.parentElement.parentElement);
                        this.removeItem(id);
                    }
                    if (cart.length === 0) {
                        this.hideCart();
                    }
                }
            })
        }


    }
    clearCartBtn() {
        let cartItems = cart.map(item => item.id);

        cartItems.forEach(id => {
            this.removeItem(id);
        });

        while (cartProducts.children.length > 0) {
            cartProducts.removeChild(cartProducts.children[0]);
        }
        this.hideCart();
    }
    removeItem(id) {

        cart = cart.filter(item => item.id !== id);
        this.setCartValue(cart);
        Storage.saveCart(cart);
        let button = this.getSignButton(id);
        button.disabled = false;
        button.innerHTML = `<i class="fas fa-shopping-cart"></i> Add to Bag`
    }
    getSignButton(id) {
        return buttonsDOM.find(button => button.dataset.id === id);
    }
    executedSideBar(products) {
        sideBarBtn.addEventListener('click', this.showSideBar);
        closeSideBarBtn.addEventListener("click", this.hideSideBar);
        const formSearch = document.querySelector(".search-form");

        formSearch.addEventListener("input", () => {
            let inputValue = searchBox.value;
            inputValue = inputValue.toLowerCase();
            let currentProducts = products.filter(item => {

                if (item.title.toLowerCase().includes(inputValue)) {
                    return item;
                }
            })

            this.setUpDefault(currentProducts);
        });
        let categoriesBtn = document.querySelectorAll(".category-btn");
        categoriesBtn.forEach(item => {
            item.addEventListener("click", e => {

                let button = e.currentTarget;
                if (button.innerText === "All") {
                    this.setUpDefault(products);
                } else {
                    let textBtn = button.innerText.toLowerCase();
                    let currentProducts = products.filter(item => {
                        if (item.title.toLowerCase().includes(textBtn)) {
                            return item;
                        }
                    })
                    this.setUpDefault(currentProducts);

                }
            })
        })

        let maxPrice = products.map(item =>item.price);
        maxPrice = Math.max(...maxPrice);
        maxPrice = Math.ceil(maxPrice);
        rangeValue.innerHTML = `Value : $ ${maxPrice}`;
        rangePrice.max = maxPrice;
        rangePrice.value = maxPrice;
        rangePrice.min = 0;
        rangePrice.addEventListener("input",()=>{
            let value = rangePrice.value;
            rangeValue.innerHTML =`Value : $ ${value}`;
            let currentProducts = products.filter(item=>{
                if (item.price<=value){
                    return item;
                }
            });
            this.setUpDefault(currentProducts);
        })
        shopping.addEventListener("click", ()=>{
            this.showCart();
        })
        
    }
    
    setUpDefault(products) {
        this.displayProducts(products);
        Storage.saveProductToStorage(products);
        this.getBagButtons();
        this.cartLogic();
    }
    showSideBar() {
        
        sideBar.classList.add("show-side-bar");
        productsSection.style.marginLeft = "20%";
        let position = productsSection.offsetTop;
        window.scrollTo({
            Left : 0,
            top : position,
        });
    }
    hideSideBar() {
        sideBar.classList.remove("show-side-bar");
        productsSection.style.marginLeft = "0%";
    }
    

}
class Storage {
    static saveProductToStorage(products) {

        localStorage.setItem("products", JSON.stringify(products));
    }
    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem("products"));
        return products.find(product => product.id === id);
    }
    static saveCart(cart) {
        localStorage.setItem("cart", JSON.stringify(cart))
    }
    static getCart() {
        return localStorage.getItem("cart") ? JSON.parse(localStorage.getItem("cart")) : [];
    }
}

document.addEventListener("DOMContentLoaded", () => {
    let ui = new UI();
    ui.setUpApp();
    let products = new Products();
    products.getProducts()
        .then(products => {
            ui.executedSideBar(products);
            ui.displayProducts(products);
            Storage.saveProductToStorage(products);

        })
        .then(() => {
            ui.getBagButtons();
            ui.cartLogic();

        });
})