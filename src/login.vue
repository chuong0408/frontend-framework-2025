<script setup>
//code chuc nang
import { ref } from 'vue';
const userName = ref('');
const passWord = ref('');
const message = ref('')
const isSuccess = ref(false);
const handleDangNhap = () => {
    if (userName.value === '') {
        message.value = "Username not empty";
    }
    else if (passWord.value === '') {
        message.value = "PassWord not empty";
    }
    else if (userName.value === 'admin' && passWord.value === '123456') {
        message.value = 'Đăng nhập thành công';
        isSuccess.value = true;
    } else {
        message.value = 'Đăng nhập thất bại';
    }
}
</script>

<template>
    <div>
        <h1>Login</h1>
        <form action="">
            <input type="text" v-model="userName" placeholder="userName">
            <br>
            <input type="text" v-model="passWord" placeholder="passWord">
            <br>
            <input @click="handleDangNhap" type="button" value="Đăng Nhập">
            <span :style="{ color: isSuccess ? 'green' : 'red' }">{{ message }}</span>
        </form>
    </div>
</template>

<style scoped>
form input {
    display: block;
    margin-top: 20px;
}
</style>