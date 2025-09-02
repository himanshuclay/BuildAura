<!-- components/SignatureCompare.client.vue -->
<template>
  <div class="space-y-4">
    <div class="grid gap-3 md:grid-cols-2">
      <div>
        <label class="block text-sm font-medium">Signature A</label>
        <input type="file" accept="image/*" @change="onFile(0, $event)" />
      </div>
      <div>
        <label class="block text-sm font-medium">Signature B</label>
        <input type="file" accept="image/*" @change="onFile(1, $event)" />
      </div>
    </div>

    <div class="flex items-center gap-3">
      <button :disabled="!imgs[0] || !imgs[1]" @click="compare" class="px-3 py-2 rounded border">
        Compare
      </button>
      <div class="text-sm opacity-80">
        <span class="mr-2">Blur: {{ BLUR_PX }}px</span>
        <span>Threshold: {{ thresholdMode }}</span>
      </div>
    </div>

    <div v-if="result" class="space-y-2">
      <p><strong>Match (Dice):</strong> {{ result.matchPercent.toFixed(2) }}%</p>
      <p><strong>Foreground A / B / ∩:</strong> {{ result.fgA }} / {{ result.fgB }} / {{ result.intersection }}</p>
      <canvas ref="diffCanvas" class="border w-full max-w-md"></canvas>
      <div class="text-xs opacity-70">
        Diff shows where black pixels disagree (white = background / identical).
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import pixelmatch from 'pixelmatch'

type Bin = Uint8Array // 0 or 1 per pixel

const imgs = ref<(ImageBitmap | null)[]>([null, null])
const result = ref<{
  matchPercent: number
  fgA: number
  fgB: number
  intersection: number
} | null>(null)
const diffCanvas = ref<HTMLCanvasElement | null>(null)

/** Tunables */
const WIDTH = 600
const HEIGHT = 200
const BLUR_PX = 0.7                // light blur to reduce aliasing
const USE_OTSU = true              // auto threshold (recommended)
const FIXED_THRESHOLD_0_255 = 180  // fallback if USE_OTSU=false
const CROP_MARGIN = 6              // extra pixels around bbox before resize

async function onFile(idx: 0 | 1, e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (!f) return
  const img = await createImageBitmap(f)
  imgs.value[idx] = img
}

async function compare() {
  if (!imgs.value[0] || !imgs.value[1]) return

  // 1) Preprocess to a canonical, position/rotation/scale-normalized mask
  const { bin: binA, rgba: rgbaA } = await preprocessNormalized(imgs.value[0]!, WIDTH, HEIGHT)
  const { bin: binB, rgba: rgbaB } = await preprocessNormalized(imgs.value[1]!, WIDTH, HEIGHT)

  // 2) Dice coefficient on normalized binary masks
  const { dice, fgA, fgB, intersection } = diceOnBinary(binA, binB)
  result.value = { matchPercent: dice * 100, fgA, fgB, intersection }

  // 3) Visual diff (binary masks) using pixelmatch for readability
  await nextTick()
  if (diffCanvas.value) {
    const w = WIDTH, h = HEIGHT
    diffCanvas.value.width = w
    diffCanvas.value.height = h
    const out = new ImageData(w, h)
    pixelmatch(rgbaA.data, rgbaB.data, out.data, w, h, {
      threshold: 0.0,
      includeAA: false
    })
    diffCanvas.value.getContext('2d')!.putImageData(out, 0, 0)
  }
}

/** Main pipeline: draw->gray->blur->threshold->binary->normalize(PCA+centering)->crop->resize */
async function preprocessNormalized(img: ImageBitmap, W: number, H: number): Promise<{ bin: Bin; rgba: ImageData }> {
  // First pass: draw image onto a working canvas with contain-fit and optional blur
  const w0 = Math.max(W, 2 * img.width)   // roomy work area to avoid edge clipping during rotation
  const h0 = Math.max(H, 2 * img.height)
  const base = document.createElement('canvas'); base.width = w0; base.height = h0
  const bctx = base.getContext('2d')!

  // White background
  bctx.fillStyle = '#fff'
  bctx.fillRect(0, 0, w0, h0)

  // Contain-fit draw with mild blur
  const scale0 = Math.min((w0 * 0.8) / img.width, (h0 * 0.8) / img.height)
  const dw = img.width * scale0
  const dh = img.height * scale0
  const dx = (w0 - dw) / 2
  const dy = (h0 - dh) / 2
  bctx.save()
  bctx.filter = `blur(${BLUR_PX}px)`
  bctx.drawImage(img, dx, dy, dw, dh)
  bctx.restore()

  // Binarize this first pass
  let rgba0 = bctx.getImageData(0, 0, w0, h0)
  const gray0 = toGrayscale(rgba0)
  const thr = USE_OTSU ? otsu(gray0) : FIXED_THRESHOLD_0_255
  const bin0 = toBinary(gray0, thr) // 1=ink (dark), 0=bg

  // Compute centroid and principal axis (PCA) on ink points
  const { cx, cy, count } = centroid(bin0, w0, h0)
  // Handle empty ink (e.g., blank input)
  if (count === 0) {
    const emptyRGBA = maskFromBin(new Uint8Array(W * H), W, H)
    return { bin: new Uint8Array(W * H), rgba: emptyRGBA }
  }
  const angle = principalAxis(bin0, w0, h0, cx, cy) // radians; rotate by -angle

  // Second pass: build a centered+rotated canvas
  const rot = document.createElement('canvas'); rot.width = w0; rot.height = h0
  const rctx = rot.getContext('2d')!
  rctx.fillStyle = '#fff'; rctx.fillRect(0, 0, w0, h0)
  rctx.save()
  rctx.translate(w0 / 2, h0 / 2)
  rctx.rotate(-angle)
  rctx.translate(-(w0 / 2), -(h0 / 2))
  // shift so centroid lands at center
  const shiftX = (w0 / 2) - cx
  const shiftY = (h0 / 2) - cy
  rctx.drawImage(base, shiftX, shiftY)
  rctx.restore()

  // Re-binarize after rotation (interpolation can soften edges)
  const rgba1 = rctx.getImageData(0, 0, w0, h0)
  const gray1 = toGrayscale(rgba1)
  const thr1 = USE_OTSU ? otsu(gray1) : thr
  const bin1 = toBinary(gray1, thr1)

  // Find tight bbox of the ink pixels and crop with margin
  const bbox = findBBox(bin1, w0, h0)
  // If bbox invalid (shouldn't happen if count > 0), fall back
  const crop = cropToCanvas(rot, bbox, CROP_MARGIN)

  // Final: resize cropped mask with contain-fit into target (W x H)
  const final = document.createElement('canvas'); final.width = W; final.height = H
  const fctx = final.getContext('2d')!
  fctx.fillStyle = '#fff'; fctx.fillRect(0, 0, W, H)
  const scale = Math.min(W / crop.width, H / crop.height)
  const tw = crop.width * scale
  const th = crop.height * scale
  const tx = (W - tw) / 2
  const ty = (H - th) / 2
  fctx.imageSmoothingEnabled = false
  fctx.drawImage(crop, tx, ty, tw, th)

  const rgbaF = fctx.getImageData(0, 0, W, H)
  const grayF = toGrayscale(rgbaF)
  const thrF = USE_OTSU ? otsu(grayF) : thr1
  const binF = toBinary(grayF, thrF)
  const maskF = maskFromBin(binF, W, H)
  return { bin: binF, rgba: maskF }
}

/** Helpers */

function toGrayscale(rgba: ImageData): Uint8Array {
  const w = rgba.width, h = rgba.height
  const g = new Uint8Array(w * h)
  const d = rgba.data
  for (let i = 0, j = 0; i < d.length; i += 4, j++) {
    const r = d[i], gg = d[i + 1], b = d[i + 2]
    g[j] = (0.299 * r + 0.587 * gg + 0.114 * b) | 0
  }
  return g
}

function toBinary(gray: Uint8Array, thr: number): Uint8Array {
  const bin = new Uint8Array(gray.length)
  for (let i = 0; i < gray.length; i++) bin[i] = gray[i] < thr ? 1 : 0
  return bin
}

function maskFromBin(bin: Uint8Array, w: number, h: number): ImageData {
  const mask = new Uint8ClampedArray(w * h * 4)
  for (let i = 0, j = 0; i < bin.length; i++, j += 4) {
    const v = bin[i] ? 0 : 255 // black ink, white bg
    mask[j] = v; mask[j + 1] = v; mask[j + 2] = v; mask[j + 3] = 255
  }
  return new ImageData(mask, w, h)
}

function centroid(bin: Uint8Array, w: number, h: number) {
  let sx = 0, sy = 0, c = 0
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x
      if (bin[i]) { sx += x; sy += y; c++ }
    }
  }
  return { cx: c ? sx / c : w / 2, cy: c ? sy / c : h / 2, count: c }
}

// PCA major-axis angle (radians). 0 = horizontal.
// Uses covariance matrix of ink pixel coordinates.
function principalAxis(bin: Uint8Array, w: number, h: number, cx: number, cy: number): number {
  let sxx = 0, syy = 0, sxy = 0, c = 0
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x
      if (!bin[i]) continue
      const dx = x - cx, dy = y - cy
      sxx += dx * dx
      syy += dy * dy
      sxy += dx * dy
      c++
    }
  }
  if (!c) return 0
  // angle = 0.5 * atan2(2*sxy, sxx - syy)
  return 0.5 * Math.atan2(2 * sxy, (sxx - syy))
}

function findBBox(bin: Uint8Array, w: number, h: number) {
  let x0 = w, y0 = h, x1 = -1, y1 = -1
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (bin[y * w + x]) {
        if (x < x0) x0 = x
        if (x > x1) x1 = x
        if (y < y0) y0 = y
        if (y > y1) y1 = y
      }
    }
  }
  if (x1 < x0 || y1 < y0) return { x: 0, y: 0, width: w, height: h }
  return { x: x0, y: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 }
}

function cropToCanvas(src: HTMLCanvasElement, bbox: { x: number, y: number, width: number, height: number }, margin = 0) {
  const x = Math.max(0, bbox.x - margin)
  const y = Math.max(0, bbox.y - margin)
  const x2 = Math.min(src.width, bbox.x + bbox.width + margin)
  const y2 = Math.min(src.height, bbox.y + bbox.height + margin)
  const w = Math.max(1, x2 - x)
  const h = Math.max(1, y2 - y)
  const c = document.createElement('canvas'); c.width = w; c.height = h
  c.getContext('2d')!.drawImage(src, x, y, w, h, 0, 0, w, h)
  return c
}

/** Otsu's method: returns 0..255 threshold that maximizes inter-class variance */
function otsu(gray: Uint8Array): number {
  const hist = new Uint32Array(256)
  for (let i = 0; i < gray.length; i++) hist[gray[i]]++
  const total = gray.length
  let sum = 0
  for (let t = 0; t < 256; t++) sum += t * hist[t]
  let sumB = 0, wB = 0, maxVar = -1, threshold = 127
  for (let t = 0; t < 256; t++) {
    wB += hist[t]; if (wB === 0) continue
    const wF = total - wB; if (wF === 0) break
    sumB += t * hist[t]
    const mB = sumB / wB
    const mF = (sum - sumB) / wF
    const betweenVar = wB * wF * (mB - mF) * (mB - mF)
    if (betweenVar > maxVar) { maxVar = betweenVar; threshold = t }
  }
  return threshold
}

/** Dice coefficient for binary masks (1=ink, 0=bg). Also returns counts. */
function diceOnBinary(a: Bin, b: Bin) {
  if (a.length !== b.length) throw new Error('mask sizes differ')
  let fgA = 0, fgB = 0, inter = 0
  for (let i = 0; i < a.length; i++) {
    if (a[i]) fgA++
    if (b[i]) fgB++
    if (a[i] && b[i]) inter++
  }
  const denom = fgA + fgB
  const dice = denom === 0 ? 1 : (2 * inter) / denom
  return { dice, fgA, fgB, intersection: inter }
}

const thresholdMode = USE_OTSU ? 'Auto (Otsu)' : `Fixed ${FIXED_THRESHOLD_0_255}`
</script>

<style scoped>
/* minimal styles; adjust to your design */
</style>
