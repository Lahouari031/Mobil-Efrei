
<template>
  <div class="container">

    <!-- SHOP HEADER -->
    <div class="shop-header">
      <div>
        <h1>Mobil'Efrei Shop</h1>
        <p class="muted">
          Bring your international adventure home.
        </p>
      </div>

      <button class="cart-button" @click="showCart = !showCart">
        🛒 {{ cartCount }}
      </button>
    </div>

    <!-- SHOPPING CART -->
    <div v-if="showCart" class="cart-panel">

      <div class="cart-header">
        <h2>Your cart</h2>
        <button class="small-button" @click="showCart = false">
          ✕
        </button>
      </div>

      <p v-if="cart.length === 0">
        Your cart is empty.
      </p>

      <div
        v-for="item in cart"
        :key="item.name"
        class="cart-item"
      >
        <img :src="item.image" :alt="item.name" />

        <div class="cart-info">
          <h3>{{ item.name }}</h3>
          <p>{{ formatPrice(item.price * item.quantity) }}</p>
        </div>

        <button class="small-button" @click="decreaseQuantity(item)">
          −
        </button>

        <span>{{ item.quantity }}</span>

        <button class="small-button" @click="item.quantity++">
          +
        </button>

        <button class="small-button" @click="removeFromCart(item)">
          🗑️
        </button>
      </div>

      <h2 class="cart-total">
        Total: {{ formatPrice(cartTotal) }}
      </h2>

    </div>

    <!-- PRODUCTS -->
    <div class="shop-grid">

      <article
        v-for="product in products"
        :key="product.name"
        class="product"
        :class="{ selected: selectedProduct === product }"
      >

        <button
          class="product-image"
          @click="selectProduct(product)"
        >
          <img :src="product.image" :alt="product.name" />
        </button>

        <h3>{{ product.name }}</h3>

        <p class="price">
          {{ formatPrice(product.price) }}
        </p>

        <button
          v-if="selectedProduct === product"
          class="add-to-cart"
          @click="addToCart(product)"
        >
          + Add to cart
        </button>

      </article>

    </div>

  </div>
</template>

<script>
export default {
  name: 'ShopView',

  data() {
    return {
      selectedProduct: null,
      showCart: false,
      cart: [],

      products: [
        {
          name: 'I Love Cape Town T-shirt',
          price: 19.90,
          image: '/shop/tshirt.jpg'
        },
        {
          name: 'Cape Town Tote Bag',
          price: 12.90,
          image: '/shop/tote.jpg'
        },
        {
          name: 'Cape Town Cap',
          price: 14.90,
          image: '/shop/cap.jpg'
        },
        {
          name: 'Cape Town Mug',
          price: 9.90,
          image: '/shop/mug.jpg'
        }
      ]
    };
  },

  computed: {
    cartCount() {
      return this.cart.reduce(
        (total, item) => total + item.quantity, 0
      );
    },

    cartTotal() {
      return this.cart.reduce(
        (total, item) => total + item.price * item.quantity, 0
      );
    }
  },

  methods: {
    formatPrice(price) {
      return price.toFixed(2) + ' €';
    },

    selectProduct(product) {
      if (this.selectedProduct === product) {
        this.selectedProduct = null;
      } else {
        this.selectedProduct = product;
      }
    },

    addToCart(product) {
      const existing = this.cart.find(
        item => item.name === product.name
      );

      if (existing) {
        existing.quantity++;
      } else {
        this.cart.push({
          ...product,
          quantity: 1
        });
      }

      this.selectedProduct = null;
    },

    removeFromCart(product) {
      this.cart = this.cart.filter(
        item => item.name !== product.name
      );
    },

    decreaseQuantity(product) {
      if (product.quantity > 1) {
        product.quantity--;
      } else {
        this.removeFromCart(product);
      }
    }
  }
};
</script>

<style scoped>

.shop-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.shop-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  align-items: start;
  gap: 24px;
  margin: 30px 0;
}

.product {
  border: 1px solid var(--line);
  border-radius: 16px;
  padding: 16px;
  text-align: center;
  transition: border-color 0.2s;
}

.product.selected {
  border-color: #f4b52e;
}

.product-image {
  width: 100%;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.product img {
  width: 100%;
  height: 240px;
  object-fit: contain;
  background: #f4f4f4;
  border-radius: 10px;
  transition: opacity 0.2s;
}

.product-image:hover img {
  opacity: 0.85;
}

.price {
  color: var(--yellow);
  font-size: 24px;
  font-weight: bold;
}

.add-to-cart {
  width: 100%;
  background: #f4b52e;
  color: #062b61;
  border: none;
  border-radius: 10px;
  padding: 12px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 10px;
  animation: appear 0.2s ease;
}

.add-to-cart:hover {
  background: #ffd166;
}

.cart-button {
  background: #f4b52e;
  color: #062b61;
  border: none;
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 22px;
  font-weight: bold;
  cursor: pointer;
}

.cart-panel {
  background: #0b3268;
  border: 1px solid #34547e;
  border-radius: 16px;
  padding: 25px;
  margin-top: 25px;
  color: white;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cart-item {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
  padding: 15px 0;
  border-bottom: 1px solid #34547e;
}

.cart-item img {
  width: 80px;
  height: 80px;
  object-fit: contain;
  background: white;
  border-radius: 8px;
}

.cart-info {
  flex: 1;
}

.small-button {
  background: #ffffff15;
  color: white;
  border: 1px solid #34547e;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
}

.cart-total {
  color: #f4b52e;
  text-align: right;
  margin-top: 25px;
}

@keyframes appear {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

</style>
