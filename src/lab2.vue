<script setup>
import { ref, reactive } from 'vue'

const products = [
  {
    name: "Sản phẩm 1",
    description: "Mô tả sản phẩm 1, rất chất lượng và đáng mua.",
    price: 500000,
    image: "http://picsum.photos/id/1/300/300",
  },
  {
    name: "Sản phẩm 2",
    description: "Mô tả sản phẩm 2, chất lượng tốt và giá phải chăng.",
    price: 300000,
    image: "http://picsum.photos/id/2/300/300",
  },
  {
    name: "Sản phẩm 3",
    description: "Mô tả sản phẩm 3, sản phẩm cao cấp và nhiều tính năng.",
    price: 1000000,
    image: "http://picsum.photos/id/3/300/300",
  }
]

const quantities = products.map(() => ref(0))

function increase(idx) {
  quantities[idx].value++
}
function decrease(idx) {
  if (quantities[idx].value > 0) quantities[idx].value--
}

const user = reactive({
  name: '',
  age: '',
  email: ''
})
const updatedUser = reactive({
  name: '',
  age: '',
  email: ''
})
function updateUser() {
  updatedUser.name = user.name
  updatedUser.age = user.age
  updatedUser.email = user.email
}

const oneWayText = ref('Đây là one-way binding')
const twoWayText = ref('')

const dtb = ref(0)
const dtbWarning = ref('')

function validateDTB() {
  if (dtb.value > 10) {
    dtb.value = 10
    dtbWarning.value = 'Điểm không được vượt quá 10'
  } else if (dtb.value < 0) {
    dtb.value = 0
    dtbWarning.value = 'Điểm không được nhỏ hơn 0'
  } else {
    dtbWarning.value = ''
  }
}

const username = ref('')
const password = ref('')
const message = ref('')
const loginSuccess = ref(false)

function handleLogin() {
  if (!username.value || !password.value) {
    message.value = 'Vui lòng nhập đầy đủ thông tin'
    loginSuccess.value = false
    return
  }

  if (username.value === 'admin' && password.value === '123456') {
    message.value = 'Đăng nhập thành công'
    loginSuccess.value = true
  } else {
    message.value = 'Đăng nhập thất bại'
    loginSuccess.value = false
  }
}
</script>

<template>
  <div style="padding: 20px; max-width: 600px; margin: auto">
    <!-- Bài 1 -->
    <div class="card">
      <h2>Bài 1: Quản lý số lượng sản phẩm</h2>
      <div v-for="(product, idx) in products" :key="product.name" class="product">
        <img :src="product.image" alt="" />
        <div class="product-info">
          <strong>{{ product.name }}</strong>
          <p>{{ product.description }}</p>
          <p>Giá: {{ product.price.toLocaleString() }}đ</p>
          <p>Số lượng: {{ quantities[idx] }}</p>
          <button @click="decrease(idx)">-</button>
          <button @click="increase(idx)">+</button>
        </div>
      </div>
    </div>


    <hr />

    <!-- Bài 2 -->
    <h2>Bài 2: Thông tin người dùng</h2>
    <input v-model="user.name" placeholder="Tên" />
    <input v-model="user.age" placeholder="Tuổi" />
    <input v-model="user.email" placeholder="Email" />
    <button @click="updateUser">Cập nhật</button>

    <p>Sau khi cập nhật:</p>
    <ul>
      <li>Tên: {{ updatedUser.name }}</li>
      <li>Tuổi: {{ updatedUser.age }}</li>
      <li>Email: {{ updatedUser.email }}</li>
    </ul>

    <hr />

    <!-- Bài 3 -->
    <h2>Bài 3: Data Binding</h2>
    <p>{{ oneWayText }}</p>
    <input v-model="twoWayText" placeholder="Two-way binding" />
    <p>Giá trị nhập: {{ twoWayText }}</p>

    <hr />

    <h2>Điểm trung bình</h2>
    <input type="number" v-model="dtb" @input="validateDTB" />
    <p v-if="dtbWarning" style="color: red;">{{ dtbWarning }}</p>
    <p>Xếp loại:
      <span v-if="dtb < 5">Yếu</span>
      <span v-else-if="dtb < 6.5">Trung bình</span>
      <span v-else-if="dtb < 8">Khá</span>
      <span v-else-if="dtb < 9">Giỏi</span>
      <span v-else>Xuất sắc</span>
    </p>

    <hr />

    <!-- Đăng nhập -->
    <h2>Đăng nhập</h2>
    <input type="text" v-model="username" placeholder="Username" />
    <input type="password" v-model="password" placeholder="Password" />
    <button @click="handleLogin">Đăng nhập</button>
    <p :style="{ color: loginSuccess ? 'green' : 'red' }">{{ message }}</p>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', sans-serif;
  background-color: #f9f9f9;
}

h2 {
  margin-top: 40px;
  color: #333;
}

.card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 16px;
  margin-bottom: 24px;
}

.product {
  display: flex;
  align-items: center;
  gap: 16px;
}

.product img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
}

.product-info {
  flex: 1;
}

input {
  margin-bottom: 12px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 6px;
  width: 100%;
  max-width: 300px;
}

button {
  padding: 8px 16px;
  margin-right: 8px;
  border: none;
  border-radius: 6px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

button:hover {
  background-color: #0056b3;
}

hr {
  margin: 40px 0;
  border: none;
  border-top: 1px solid #ddd;
}
</style>