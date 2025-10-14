<script setup>
import { ref } from 'vue'

const files = ref([])

const handleUpload = async () => {
  const formData = new FormData()
  files.value.forEach(file => formData.append('images[]', file))

  await fetch('/api/upload', {
    method: 'POST',
    body: formData
  })
}
</script>

<template>
  <input type="file" multiple @change="e => files.value = Array.from(e.target.files)" />
  <button @click="handleUpload">Upload</button>
</template>
