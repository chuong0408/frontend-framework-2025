<script setup>
import { ref, reactive } from "vue";
// code trong này
// import Modal from "./components/Modal.vue";
// import ChildComponent from "./components/ChildComponent.vue";
// import Lab2 from './lab2.vue'
// import BaseLayout from "./component/BaseLayout.vue";
// import Loginform from "./component/loginform.vue";
import Demstore from "./components/demoVuex.vue"
/**
 * tên
 * chuyên ngành
 * điểm mạnh
 * điểm yếu
 * ước mơ
 * điểm trung bình
 */
const products = reactive([
  {
    "id": "12345",
    "name": "Example Product 1",
    "price": 19.99,
    "category": "Electronics",
    "image": "https://picsum.photos/200/300"
  },
  {
    "id": "67890",
    "name": "Example Product 2",
    "price": 24.99,
    "category": "Home & Kitchen",
    "image": "https://picsum.photos/200/300"
  },
  {
    "id": "54321",
    "name": "Example Product 3",
    "price": 9.99,
    "category": "Books",
    "image": "https://picsum.photos/200/300"
  },
  {
    "id": "09876",
    "name": "Example Product 4",
    "price": 49.99,
    "category": "Fashion",
    "image": "https://picsum.photos/200/300"
  },
  {
    "id": "45678",
    "name": "Example Product 5",
    "price": 14.99,
    "category": "Electronics",
    "image": "https://picsum.photos/200/300"
  },
])
const handleDeleteParent = (id) => {
  console.log('will call delete id', id)
}
const dynamicSlotName = ref("header");
const switchSlot = () => {
  dynamicSlotName.value = dynamicSlotName.value === "header" ? "footer" : "header";
};
</script>

<template>
  <div class="container">
    <!-- <ThongBao />
  <h1>Frontend framework 2025</h1>
  <ThongBao message="thông báo mới" />
  <TrangThai/>
  <Products :products="products"/>
  <Login/> -->
    <!-- <ListPost @remove="handleDeleteParent" />
  <Modal/> -->
    <!-- <ChildComponent v-slot="{ message }"> -->
    <!-- <template v-slot:header>Đây là header được truyền từ component cha</template>
<template v-slot:footer>Đây là footer được truyền từ component cha</template> -->
    <!-- <p>{{message}}</p> -->



    <!-- </ChildComponent> -->

    <!-- <ChildComponent>
      <template #[dynamicSlotName]>
        <p>Nội dung của slot {{ dynamicSlotName }}</p>
      </template>
    </ChildComponent>
    <button @click="switchSlot">Chuyển slot</button> -->
  </div>
  <!-- <BaseLayout>
    <template #content>
        <router-view></router-view>
    </template>
  </BaseLayout> -->
  <!-- <Lab2/> -->
  <!-- <Demostore/> -->
  <router-view />
</template>

<style scoped>
h1 {
  color: red
}
</style>