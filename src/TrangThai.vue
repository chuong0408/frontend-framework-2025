<script setup>
import {ref} from 'vue'
const message = ref("Ban chua co thong tin")
const dem = ref(0)
const tuoi = ref(0)
const thongBao = () => {
    message.value = "Xin Chao ban"
}
const tang = () => {
    tuoi.value++
    console.log(tuoi.value)
}
const giam = () => {
    tuoi.value--
}

</script>
<template>
    <h1>Hien Thi Thong Tin</h1>
    <p>{{ message }}</p>
    <p>{{ dem }}|{{ tuoi }} Tuoi</p>
    <button @click="thongBao">Kiem Tra</button>
    <button @click="tang">Tang</button>
    <button @click="giam">Giam</button>
    <hr>
    <p v-if="tuoi<6">Chua Di Hoc</p>
    <p v-else-if="tuoi<12">Hoc Cap 1</p>
    <p v-else-if="tuoi<16">Hoc Cap 2</p>
    <p v-else-if="tuoi<19">Hoc Cap 3</p>
    <p v-else>Da Hoc Xong</p>
    <hr>
    <div v-show="tuoi>18">
        <img src="https://tse4.mm.bing.net/th/id/OIP.CQqp5GKFEidrqQHpZfIYfAHaFK?r=0&rs=1&pid=ImgDetMain&o=7&rm=3" alt="">
    </div>
</template>
<style scoped>
h1{
  font-family: 'Courier New', Courier, monospace;
  color: blue;
  text-align: center;
  text-transform: uppercase;
  text-shadow: 2px 2px 5px red;
  padding: 10px;
  border-radius: 10px;
}
p{
  font-family: 'Courier New', Courier, monospace;
  color: blue;
  text-align: center;
  text-transform: uppercase;
  padding: 10px;
  border-radius: 10px;
}
button{
  font-family: 'Courier New', Courier, monospace;
  color: blue;
  text-transform: uppercase;
  padding: 10px;
  border-radius: 10px;
}
</style>