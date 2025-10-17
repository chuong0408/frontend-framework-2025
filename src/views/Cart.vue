<template>
  <div class="cart-container">
    <h2>🛒 Giỏ hàng của bạn</h2>

    <div v-if="cart.items.length === 0" class="empty-cart">
      <div class="empty-icon">🛍️</div>
      <p>Giỏ hàng trống</p>
      <router-link to="/products" class="btn-shop">Tiếp tục mua sắm</router-link>
    </div>

    <div v-else class="cart-content">
      <div class="cart-items">
        <div v-for="item in cart.items" :key="item.id" class="cart-item">
          <div class="item-image">
            <img :src="getImageUrl(item.image)" :alt="item.name" @error="handleImageError" />
          </div>
          
          <div class="item-info">
            <h3>{{ item.name }}</h3>
            <p class="item-price">{{ formatPrice(item.discount) }}₫</p>
          </div>
          
          <div class="item-quantity">
            <button @click="decreaseQuantity(item)" class="qty-btn">-</button>
            <input 
              type="number" 
              :value="item.quantity" 
              @input="updateQuantity(item, $event)"
              min="1"
              class="qty-input"
            />
            <button @click="increaseQuantity(item)" class="qty-btn">+</button>
          </div>
          
          <div class="item-total">
            <strong>{{ formatPrice(item.discount * item.quantity) }}₫</strong>
          </div>
          
          <button @click="removeItem(item.id)" class="btn-remove">🗑️</button>
        </div>
      </div>
      
      <div class="cart-summary">
        <h3>Tổng quan đơn hàng</h3>
        
        <div class="summary-row">
          <span>Tổng số sản phẩm:</span>
          <strong>{{ cart.totalItems }}</strong>
        </div>
        
        <div class="summary-row">
          <span>Tạm tính:</span>
          <span>{{ formatPrice(cart.totalPrice) }}₫</span>
        </div>
        
        <div class="summary-row">
          <span>Phí vận chuyển:</span>
          <span>Miễn phí</span>
        </div>
        
        <hr />
        
        <div class="summary-row total">
          <span>Tổng cộng:</span>
          <strong class="total-price">{{ formatPrice(cart.totalPrice) }}₫</strong>
        </div>
        
        <button @click="checkout" class="btn-checkout">Thanh toán</button>
        <button @click="clearCart" class="btn-clear">Xóa giỏ hàng</button>
        <router-link to="/products" class="btn-continue">← Tiếp tục mua sắm</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { cart } from '../store/cart'

const router = useRouter()
const API_BASE_URL = 'http://localhost:3001'

const getImageUrl = (imagePath) => {
  if (!imagePath) return ''
  return imagePath.startsWith('http') ? imagePath : `${API_BASE_URL}${imagePath}`
}

const handleImageError = (e) => {
  e.target.src = 'https://via.placeholder.com/100x100?text=No+Image'
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN').format(price || 0)
}

const increaseQuantity = (item) => {
  cart.updateQuantity(item.id, item.quantity + 1)
}

const decreaseQuantity = (item) => {
  if (item.quantity > 1) {
    cart.updateQuantity(item.id, item.quantity - 1)
  }
}

const updateQuantity = (item, event) => {
  const newQty = parseInt(event.target.value) || 1
  cart.updateQuantity(item.id, newQty)
}

const removeItem = (id) => {
  if (confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
    cart.removeItem(id)
  }
}

const clearCart = () => {
  if (confirm('Bạn có chắc muốn xóa toàn bộ giỏ hàng?')) {
    cart.clearCart()
  }
}

const checkout = () => {
  if (cart.items.length === 0) {
    alert('Giỏ hàng trống!')
    return
  }
  router.push('/checkout')
}
</script>

<style scoped>
.cart-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h2 {
  margin-bottom: 30px;
  color: #333;
  font-size: 32px;
  font-weight: 700;
}

.empty-cart {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 20px;
}

.empty-cart p {
  font-size: 20px;
  color: #666;
  margin-bottom: 30px;
}

.btn-shop {
  display: inline-block;
  padding: 12px 30px;
  background-color: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
  transition: background-color 0.3s;
}

.btn-shop:hover {
  background-color: #0056b3;
}

.cart-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
}

@media (max-width: 992px) {
  .cart-content {
    grid-template-columns: 1fr;
  }
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cart-item {
  display: grid;
  grid-template-columns: 100px 1fr auto auto auto;
  gap: 20px;
  align-items: center;
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.3s;
}

.cart-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .cart-item {
    grid-template-columns: 80px 1fr;
    gap: 15px;
  }
  
  .item-quantity,
  .item-total {
    grid-column: 1 / -1;
  }
  
  .btn-remove {
    grid-column: 2 / -1;
    justify-self: end;
  }
}

.item-image {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f5f5f5;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info h3 {
  margin: 0 0 10px;
  font-size: 18px;
  color: #333;
  font-weight: 600;
}

.item-price {
  color: #e53935;
  font-weight: 600;
  margin: 0;
  font-size: 16px;
}

.item-quantity {
  display: flex;
  align-items: center;
  gap: 5px;
}

.qty-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  border-radius: 4px;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  font-weight: 600;
  color: #333;
}

.qty-btn:hover {
  background-color: #f5f5f5;
  border-color: #999;
}

.qty-btn:active {
  transform: scale(0.95);
}

.qty-input {
  width: 60px;
  text-align: center;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 5px;
  font-size: 16px;
  font-weight: 600;
}

.qty-input:focus {
  outline: none;
  border-color: #007bff;
}

.item-total {
  min-width: 120px;
  text-align: right;
  font-size: 18px;
}

.btn-remove {
  background: none;
  border: none;
  font-size: 22px;
  cursor: pointer;
  transition: transform 0.2s;
  padding: 5px;
}

.btn-remove:hover {
  transform: scale(1.2);
}

.cart-summary {
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  height: fit-content;
  position: sticky;
  top: 20px;
}

.cart-summary h3 {
  margin: 0 0 20px;
  color: #333;
  font-size: 20px;
  font-weight: 700;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  color: #666;
  font-size: 15px;
}

.summary-row.total {
  font-size: 20px;
  color: #333;
  margin-top: 15px;
  padding-top: 15px;
}

.total-price {
  color: #e53935;
  font-size: 24px;
}

hr {
  border: none;
  border-top: 1px solid #eee;
  margin: 20px 0;
}

.btn-checkout,
.btn-clear,
.btn-continue {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 10px;
  text-align: center;
  text-decoration: none;
  display: block;
}

.btn-checkout {
  background-color: #28a745;
  color: white;
}

.btn-checkout:hover {
  background-color: #218838;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(40, 167, 69, 0.3);
}

.btn-clear {
  background-color: #dc3545;
  color: white;
}

.btn-clear:hover {
  background-color: #c82333;
}

.btn-continue {
  background-color: #6c757d;
  color: white;
}

.btn-continue:hover {
  background-color: #5a6268;
}
</style>