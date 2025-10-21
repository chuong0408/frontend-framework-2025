<script setup>
import { useStore } from 'vuex';
import { computed } from 'vue';

const store = useStore()
const demo = computed(()=> store.state) 
console.log('demo',store)
const handleButtonIncrease = ()=>{
    store.dispatch('increamentAsync')
}
const handeButtonDecrease = ()=>{
    store.commit('decrease')
    store.dispatch("")
}
</script>
<template>
    <h1>demo vuex</h1>
</template>