<template>
  <button class="btn btn-primary" @click="show">Open modal</button>

  <div class="modal fade" tabindex="-1" ref="modalEl">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Bootstrap Modal</h5>
          <button type="button" class="btn-close" @click="hide"></button>
        </div>
        <div class="modal-body">
          Content here…
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="hide">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
let bsModal = null
const modalEl = ref(null)

const show = () => bsModal?.show()
const hide = () => bsModal?.hide()

onMounted(async () => {
  // Ensure Bootstrap JS is loaded on the page
  const { Modal } = await import('bootstrap') // or window.bootstrap.Modal
  bsModal = new Modal(modalEl.value, { backdrop: true, keyboard: true })
})

onBeforeUnmount(() => {
  bsModal?.dispose()
})
</script>