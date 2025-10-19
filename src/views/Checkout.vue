<template>
    <div class="checkout-container">
        <h2>💳 Thanh toán</h2>

        <div v-if="cart.items.length === 0" class="empty-cart">
            <div class="empty-icon">🛍️</div>
            <p>Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi thanh toán!</p>
            <router-link to="/products" class="btn-shop">Tiếp tục mua sắm</router-link>
        </div>

        <div v-else class="checkout-content">
            <div class="customer-info">
                <div class="section-card">
                    <h3>📋 Thông tin khách hàng</h3>

                    <div class="form-group">
                        <label>Họ và tên <span class="required">*</span></label>
                        <input v-model="orderForm.fullName" type="text" placeholder="Nhập họ và tên"
                            :class="{ error: errors.fullName }" />
                        <span v-if="errors.fullName" class="error-message">{{ errors.fullName }}</span>
                    </div>

                    <div class="form-group">
                        <label>Số điện thoại <span class="required">*</span></label>
                        <input v-model="orderForm.phone" type="tel" placeholder="Nhập số điện thoại"
                            :class="{ error: errors.phone }" />
                        <span v-if="errors.phone" class="error-message">{{ errors.phone }}</span>
                    </div>

                    <div class="form-group">
                        <label>Email <span class="required">*</span></label>
                        <input v-model="orderForm.email" type="email" placeholder="Nhập email"
                            :class="{ error: errors.email }" />
                        <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
                    </div>
                </div>

                <div class="section-card">
                    <h3>🏠 Địa chỉ giao hàng</h3>

                    <div class="form-group">
                        <label>Địa chỉ <span class="required">*</span></label>
                        <input v-model="orderForm.address" type="text" placeholder="Số nhà, tên đường"
                            :class="{ error: errors.address }" />
                        <span v-if="errors.address" class="error-message">{{ errors.address }}</span>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label>Tỉnh/Thành phố <span class="required">*</span></label>
                            <select v-model="orderForm.city" :class="{ error: errors.city }">
                                <option value="">-- Chọn Tỉnh/TP --</option>
                                <option value="hanoi">Hà Nội</option>
                                <option value="hcm">TP. Hồ Chí Minh</option>
                                <option value="danang">Đà Nẵng</option>
                                <option value="haiphong">Hải Phòng</option>
                                <option value="cantho">Cần Thơ</option>
                            </select>
                            <span v-if="errors.city" class="error-message">{{ errors.city }}</span>
                        </div>

                        <div class="form-group">
                            <label>Quận/Huyện <span class="required">*</span></label>
                            <input v-model="orderForm.district" type="text" placeholder="Nhập quận/huyện"
                                :class="{ error: errors.district }" />
                            <span v-if="errors.district" class="error-message">{{ errors.district }}</span>
                        </div>
                    </div>
                </div>

                <div class="section-card">
                    <h3>💳 Phương thức thanh toán</h3>

                    <div class="payment-methods">
                        <label class="payment-option">
                            <input type="radio" v-model="orderForm.paymentMethod" value="cod" />
                            <div class="payment-card">
                                <span class="payment-icon">💵</span>
                                <div>
                                    <strong>Thanh toán khi nhận hàng (COD)</strong>
                                    <p>Thanh toán bằng tiền mặt khi nhận hàng</p>
                                </div>
                            </div>
                        </label>

                        <!-- <label class="payment-option">
                            <input type="radio" v-model="orderForm.paymentMethod" value="transfer" />
                            <div class="payment-card">
                                <span class="payment-icon">🏦</span>
                                <div>
                                    <strong>Chuyển khoản ngân hàng</strong>
                                    <p>Chuyển khoản trước, giao hàng sau</p>
                                </div>
                            </div>
                        </label> -->
                    </div>
                </div>

            </div>

            <div class="order-summary">
                <div class="summary-card">
                    <h3>📦 Đơn hàng của bạn</h3>

                    <div class="order-items">
                        <div v-for="item in cart.items" :key="item.id" class="order-item">
                            <div class="item-image">
                                <img :src="getImageUrl(item.image)" :alt="item.name" @error="handleImageError" />
                            </div>
                            <div class="item-details">
                                <h4>{{ item.name }}</h4>
                                <p>{{ formatPrice(item.discount) }}₫ × {{ item.quantity }}</p>
                            </div>
                            <div class="item-total">
                                {{ formatPrice(item.discount * item.quantity) }}₫
                            </div>
                        </div>
                    </div>

                    <div class="summary-divider"></div>

                    <div class="summary-row">
                        <span>Tạm tính:</span>
                        <strong>{{ formatPrice(cart.totalPrice) }}₫</strong>
                    </div>

                    <div class="summary-row">
                        <span>Phí vận chuyển:</span>
                        <strong class="shipping-fee">{{ shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee) + '₫'
                        }}</strong>
                    </div>

                    <div class="summary-row">
                        <span>Giảm giá:</span>
                        <strong class="discount-amount">-{{ formatPrice(discountAmount) }}₫</strong>
                    </div>

                    <div class="summary-divider"></div>

                    <div class="summary-row total">
                        <span>Tổng cộng:</span>
                        <strong class="total-amount">{{ formatPrice(totalAmount) }}₫</strong>
                    </div>

                    <div class="discount-code">
                        <input v-model="discountCode" type="text" placeholder="Nhập mã giảm giá" />
                        <button @click="applyDiscount" class="btn-apply">Áp dụng</button>
                    </div>

                    <button @click="placeOrder" class="btn-checkout" :disabled="loading">
                        {{ loading ? 'Đang xử lý...' : '🎯 Đặt hàng' }}
                    </button>

                    <router-link to="/cart" class="btn-back-cart">
                        ← Quay lại giỏ hàng
                    </router-link>
                </div>

                <div class="guarantee-info">
                    <div class="guarantee-item">
                        <span class="guarantee-icon">✅</span>
                        <div>
                            <strong>Đảm bảo chất lượng</strong>
                            <p>Sản phẩm chính hãng 100%</p>
                        </div>
                    </div>
                    <div class="guarantee-item">
                        <span class="guarantee-icon">🔒</span>
                        <div>
                            <strong>Thanh toán an toàn</strong>
                            <p>Bảo mật thông tin khách hàng</p>
                        </div>
                    </div>
                    <div class="guarantee-item">
                        <span class="guarantee-icon">🚚</span>
                        <div>
                            <strong>Giao hàng nhanh</strong>
                            <p>Giao hàng trong 2-3 ngày</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { cart } from '../store/cart'
import { auth } from '../store/auth'
import axios from 'axios'

const router = useRouter()
const API_BASE_URL = 'http://localhost:3001'

const loading = ref(false)
const discountCode = ref('')
const discountAmount = ref(0)
const shippingFee = ref(0)

const orderForm = reactive({
    fullName: auth.user?.fullName || '',
    phone: '',
    email: auth.user?.email || '',
    address: '',
    city: '',
    district: '',
    paymentMethod: 'cod',
    note: ''
})

const errors = reactive({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    district: ''
})

const totalAmount = computed(() => {
    return cart.totalPrice + shippingFee.value - discountAmount.value
})

const getImageUrl = (imagePath) => {
    if (!imagePath) return ''
    return imagePath.startsWith('http') ? imagePath : `${API_BASE_URL}${imagePath}`
}

const handleImageError = (e) => {
    e.target.src = 'https://via.placeholder.com/80x80?text=No+Image'
}

const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price || 0)
}

const validateForm = () => {
    let isValid = true

    Object.keys(errors).forEach(key => errors[key] = '')

    if (!orderForm.fullName.trim()) {
        errors.fullName = 'Vui lòng nhập họ và tên'
        isValid = false
    }

    if (!orderForm.phone.trim()) {
        errors.phone = 'Vui lòng nhập số điện thoại'
        isValid = false
    } else if (!/^[0-9]{10,11}$/.test(orderForm.phone)) {
        errors.phone = 'Số điện thoại không hợp lệ'
        isValid = false
    }

    if (!orderForm.email.trim()) {
        errors.email = 'Vui lòng nhập email'
        isValid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(orderForm.email)) {
        errors.email = 'Email không hợp lệ'
        isValid = false
    }

    if (!orderForm.address.trim()) {
        errors.address = 'Vui lòng nhập địa chỉ'
        isValid = false
    }

    if (!orderForm.city) {
        errors.city = 'Vui lòng chọn Tỉnh/TP'
        isValid = false
    }

    if (!orderForm.district.trim()) {
        errors.district = 'Vui lòng nhập Quận/Huyện'
        isValid = false
    }

    return isValid
}

const applyDiscount = () => {
    const code = discountCode.value.trim().toUpperCase()

    if (!code) {
        alert('Vui lòng nhập mã giảm giá')
        return
    }

    const discounts = {
        'WELCOME10': 10,
        'SALE20': 20,
        'VIP50': 50
    }

    if (discounts[code]) {
        if (code.includes('VIP')) {
            discountAmount.value = discounts[code] * 1000
        } else {
            discountAmount.value = (cart.totalPrice * discounts[code]) / 100
        }
        alert(`✅ Đã áp dụng mã giảm giá "${code}" thành công!`)
    } else {
        alert('❌ Mã giảm giá không hợp lệ')
        discountAmount.value = 0
    }
}

const placeOrder = async () => {
    if (!validateForm()) {
        alert('⚠️ Vui lòng điền đầy đủ thông tin!')
        return
    }

    if (!orderForm.paymentMethod) {
        alert('⚠️ Vui lòng chọn phương thức thanh toán!')
        return
    }

    loading.value = true

    try {
        const order = {
            orderCode: 'ORD' + Date.now(),
            customer: {
                fullName: orderForm.fullName,
                phone: orderForm.phone,
                email: orderForm.email,
                address: `${orderForm.address}, ${orderForm.district}, ${orderForm.city}`,
                userId: auth.user?.id || null
            },
            items: cart.items.map(item => ({
                productId: item.id,
                name: item.name,
                image: item.image,
                quantity: item.quantity,
                price: item.discount,
                total: item.discount * item.quantity
            })),
            payment: {
                method: orderForm.paymentMethod,
                subtotal: cart.totalPrice,
                shipping: shippingFee.value,
                discount: discountAmount.value,
                total: totalAmount.value
            },
            note: orderForm.note,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }

        console.log('📦 Đang lưu đơn hàng:', order)

        const response = await axios.post(`${API_BASE_URL}/orders`, order)

        if (response.status === 201) {
            console.log('✅ Đơn hàng đã được lưu:', response.data)

            cart.clearCart()

            alert(`✅ Đặt hàng thành công!\n\nMã đơn hàng: ${order.orderCode}\nTổng tiền: ${formatPrice(totalAmount.value)}₫\n\nCảm ơn bạn đã mua hàng!`)

            router.push('/')
        }
    } catch (error) {
        console.error(' Lỗi đặt hàng:', error)
        alert(' Có lỗi xảy ra. Vui lòng thử lại!')
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
.checkout-container {
    max-width: 1400px;
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
    font-size: 18px;
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
}

.checkout-content {
    display: grid;
    grid-template-columns: 1fr 450px;
    gap: 30px;
}

@media (max-width: 1200px) {
    .checkout-content {
        grid-template-columns: 1fr;
    }
}

.customer-info {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.section-card {
    background: white;
    padding: 25px;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section-card h3 {
    margin: 0 0 20px;
    font-size: 20px;
    color: #333;
    font-weight: 700;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #333;
    font-size: 14px;
}

.required {
    color: #e53935;
}

.form-group input,
.form-group select,
.form-group textarea {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 15px;
    transition: border-color 0.3s;
    box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
    outline: none;
    border-color: #007bff;
}

.form-group input.error,
.form-group select.error {
    border-color: #e53935;
}

.error-message {
    display: block;
    color: #e53935;
    font-size: 13px;
    margin-top: 5px;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
}

@media (max-width: 768px) {
    .form-row {
        grid-template-columns: 1fr;
    }
}

.payment-methods {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.payment-option {
    cursor: pointer;
}

.payment-option input[type="radio"] {
    display: none;
}

.payment-card {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 15px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    transition: all 0.3s;
}

.payment-option input[type="radio"]:checked+.payment-card {
    border-color: #007bff;
    background-color: #f0f8ff;
}

.payment-icon {
    font-size: 32px;
}

.payment-card strong {
    display: block;
    color: #333;
    margin-bottom: 5px;
}

.payment-card p {
    margin: 0;
    font-size: 13px;
    color: #666;
}

textarea {
    resize: vertical;
}

.order-summary {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.summary-card {
    background: white;
    padding: 25px;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    position: sticky;
    top: 20px;
}

.summary-card h3 {
    margin: 0 0 20px;
    font-size: 20px;
    color: #333;
    font-weight: 700;
}

.order-items {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-bottom: 20px;
    max-height: 300px;
    overflow-y: auto;
}

.order-item {
    display: flex;
    gap: 15px;
    align-items: center;
}

.item-image {
    width: 60px;
    height: 60px;
    border-radius: 6px;
    overflow: hidden;
    background-color: #f5f5f5;
    flex-shrink: 0;
}

.item-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.item-details {
    flex: 1;
}

.item-details h4 {
    margin: 0 0 5px;
    font-size: 15px;
    color: #333;
}

.item-details p {
    margin: 0;
    font-size: 13px;
    color: #666;
}

.item-total {
    font-weight: 600;
    color: #333;
    font-size: 15px;
}

.summary-divider {
    height: 1px;
    background-color: #eee;
    margin: 20px 0;
}

.summary-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
    font-size: 15px;
}

.summary-row.total {
    font-size: 20px;
    margin-top: 15px;
    padding-top: 15px;
}

.total-amount {
    color: #e53935;
    font-size: 24px;
}

.shipping-fee {
    color: #28a745;
}

.discount-amount {
    color: #e53935;
}

.discount-code {
    display: flex;
    gap: 10px;
    margin: 20px 0;
}

.discount-code input {
    flex: 1;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 6px;
}

.btn-apply {
    padding: 10px 20px;
    background-color: #28a745;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
}

.btn-apply:hover {
    background-color: #218838;
}

.btn-checkout {
    width: 100%;
    padding: 15px;
    background-color: #e53935;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 18px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s;
    margin-top: 10px;
}

.btn-checkout:hover:not(:disabled) {
    background-color: #c62828;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(229, 57, 53, 0.4);
}

.btn-checkout:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-back-cart {
    display: block;
    text-align: center;
    padding: 12px;
    color: #666;
    text-decoration: none;
    margin-top: 10px;
    transition: color 0.3s;
}

.btn-back-cart:hover {
    color: #007bff;
}

.guarantee-info {
    background: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.guarantee-item {
    display: flex;
    gap: 12px;
    align-items: flex-start;
}

.guarantee-icon {
    font-size: 24px;
    flex-shrink: 0;
}

.guarantee-item strong {
    display: block;
    color: #333;
    margin-bottom: 3px;
    font-size: 14px;
}

.guarantee-item p {
    margin: 0;
    color: #666;
    font-size: 13px;
}
</style>