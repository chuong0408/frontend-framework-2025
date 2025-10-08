<script setup>
import { provide, ref } from 'vue';
import ChildofChildComponent from './ChildofChildComponent.vue';
const message = ref('')
    const greeting = "change data here";
    const users = [
    { id: 1, name: 'An',    score: 9.2 },
    { id: 2, name: 'Bình',  score: 8.5 },
    { id: 3, name: 'Chi',   score: 9.0 },
    ]
/** send message to parent */
provide("message", message)
</script>
<template>
    <div>
        <h1>this is child component</h1>
        <slot name="header"></slot>
        <slot name="footer"></slot>
        <!-- <button @click="handleChangeText">change text</button> -->
        <!-- <slot></slot> -->
         <!-- <header><slot name="header"></slot></header>
         <footer><slot name="footer"></slot></footer> -->
         <slot :message="greeting"></slot> 
         <input v-model="message" placeholder="enter data"/>
         <ChildofChildComponent/>
    </div>
</template>