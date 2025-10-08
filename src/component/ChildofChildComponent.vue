<script setup>
import { inject } from 'vue';
const message = inject('message');
</script>
<template>
    <p class="alert alert-success">{{ message }}</p>
</template>