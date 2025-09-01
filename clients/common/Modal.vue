<template>
  <div v-if="show" class="modal-backdrop" @click.self="close">
    <div class="modal">
      <!-- Header -->
      <div class="modal-header">
        <slot name="header">
          <h3>Default Title</h3>
        </slot>
        <button class="icon-btn" @click="close" aria-label="Close">✕</button>
      </div>

      <!-- Body -->
      <div class="modal-body">
        <slot>
          Default body content...
        </slot>
      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <slot name="footer">
          <button class="btn ghost" @click="close">Close</button>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  show: Boolean
})
const emit = defineEmits(['close'])

function close () {
  emit('close')
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.5);
  display: grid;
  place-items: center;
  z-index: 1000;
}
.modal {
  width: 100%;
  max-width: 600px;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0,0,0,.2);
  display: flex;
  flex-direction: column;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
}
.modal-body {
  padding: 16px;
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid #eee;
}
.icon-btn {
  background: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
}
.btn {
  padding: 6px 12px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
}
.btn.ghost {
  background: #f3f4f6;
}
.btn.ghost:hover {
  background: #e5e7eb;
}
</style>
