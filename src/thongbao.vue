<script setup>
//code chuc nang
defineProps({
  message:{
    type: String,
    default: "Khong co thong bao"
  }
})
</script>

<template>
  <div>
    <span>{{ message }}</span>
  </div>
</template>

<style scoped>
span{
  font-family: 'Courier New', Courier, monospace;
  color: blue;
  text-align: center;
  text-transform: uppercase;
  padding: 10px;
  border-radius: 10px;
}
</style>