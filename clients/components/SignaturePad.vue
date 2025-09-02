<template>
  <div class="sig-wrap">
    <canvas ref="canvas" class="sig-canvas"></canvas>

    <div class="controls">
      <button @click="clear">Clear</button>
      <button @click="undo">Undo</button>
      <button @click="savePng">Save PNG</button>
      <!-- <button @click="saveSvg">Save SVG</button> -->
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

let SignaturePadCtor = null
let pad = null

const canvas = ref(null)

function resizeCanvas () {
  if (!canvas.value) return
  const ratio = Math.max(window.devicePixelRatio || 1, 1)
  const parent = canvas.value.parentElement
  const width = parent.clientWidth
  const height = Math.max(180, Math.round(width * 0.35))

  canvas.value.width  = Math.floor(width * ratio)
  canvas.value.height = Math.floor(height * ratio)
  canvas.value.style.width  = width + 'px'
  canvas.value.style.height = height + 'px'

  const ctx = canvas.value.getContext('2d')
  ctx.scale(ratio, ratio)
}

function clear () {
  pad && pad.clear()
}

function undo () {
  if (!pad) return
  const data = pad.toData()
  data.pop()
  pad.fromData(data)
}

function savePng () {
  if (!pad || pad.isEmpty()) return alert('Please provide a signature first.')
  const dataUrl = pad.toDataURL('image/png')
  download(dataUrl, 'signature.png')
}

function saveSvg () {
  if (!pad || pad.isEmpty()) return alert('Please provide a signature first.')
  const dataUrl = pad.toDataURL('image/svg+xml')
  download(dataUrl, 'signature.svg')
}

function download (dataUrl, filename) {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
}

function initPad () {
  if (!canvas.value || !SignaturePadCtor) return
  pad = new SignaturePadCtor(canvas.value, {
    minWidth: 0.5,
    maxWidth: 2.5,
    throttle: 16,
    backgroundColor: 'rgba(0,0,0,0)',
    penColor: '#111'
  })
}

function onResize () {
  const data = pad ? pad.toData() : null
  resizeCanvas()
  if (data && pad) pad.fromData(data)
}

onMounted(async () => {
  const mod = await import('signature_pad') // SSR-safe dynamic import
  SignaturePadCtor = mod.default
  resizeCanvas()
  initPad()
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
})
</script>

<style scoped>
.sig-wrap { width: 100%; max-width: 720px; margin: 12px auto; }
.sig-canvas { width: 100%; height: 220px; border: 1px dashed #bbb; border-radius: 8px; background: #fff; touch-action: none; }
.controls { margin-top: 10px; display: flex; gap: 8px; flex-wrap: wrap; }
.controls button { padding: 8px 12px; border-radius: 6px; border: 1px solid #ddd; background: #f9f9f9; cursor: pointer; }
.controls button:hover { background: #f0f0f0; }
</style>
