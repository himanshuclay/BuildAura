<!-- components/SignatureEmployeeCompare.client.vue -->
<template>
  <div class="space-y-4">
    <Form @submit="handleSubmit" v-slot="{ errors }">
      <div class="grid gap-3 md:grid-cols-2">
        <div>
          <label class="block text-sm font-medium mb-1">Employee A</label>
          <Field
            as="select"
            name="employeeA"
            v-model="employeeA"
            :class="['w-full border rounded p-2', errors.employeeA && 'border-red-500']"
            rules="required"
          >
            <option value="">Select employee</option>
            <option
              v-for="e in employees"
              :key="e.id ?? e.email ?? e.name"
              :value="e.id ?? e.email ?? e.name"
            >
              {{ e.name ?? e.fullName ?? e.email }}
            </option>
          </Field>
          <ErrorMessage name="employeeA" class="text-xs text-red-600 mt-1 block" />
          <div v-if="preview[0]" class="mt-2">
            <img :src="preview[0]" alt="Signature A" class="h-20 object-contain bg-white border rounded p-1" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Employee B</label>
          <Field
            as="select"
            name="employeeB"
            v-model="employeeB"
            :class="['w-full border rounded p-2', errors.employeeB && 'border-red-500']"
            rules="required|differentFromA"
          >
            <option value="">Select employee</option>
            <option
              v-for="e in employees"
              :key="`b-${e.id ?? e.email ?? e.name}`"
              :value="e.id ?? e.email ?? e.name"
            >
              {{ e.name ?? e.fullName ?? e.email }}
            </option>
          </Field>
          <ErrorMessage name="employeeB" class="text-xs text-red-600 mt-1 block" />
          <div v-if="preview[1]" class="mt-2">
            <img :src="preview[1]" alt="Signature B" class="h-20 object-contain bg-white border rounded p-1" />
          </div>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <button
          class="px-3 py-2 rounded border"
          type="submit"
          :disabled="!imgs[0] || !imgs[1]"
          title="Load both signatures to enable"
        >
          Compare
        </button>
        <span class="text-sm opacity-80">Blur: {{ BLUR_PX }}px · Threshold: {{ thresholdMode }}</span>
      </div>
    </Form>

    <div v-if="result" class="space-y-2">
      <p><strong>Match (Dice):</strong> {{ result.matchPercent.toFixed(2) }}%</p>
      <p class="text-sm opacity-80">
        Foreground A / B / ∩:
        {{ result.fgA }} / {{ result.fgB }} / {{ result.intersection }}
      </p>
      <canvas ref="diffCanvas" class="border w-full max-w-2xl"></canvas>
      <div class="text-xs opacity-70">Diff shows disagreements between binarized strokes.</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import { Form, Field, ErrorMessage, defineRule } from 'vee-validate'
import pixelmatch from 'pixelmatch'

type Emp = {
  id?: string | number
  name?: string
  fullName?: string
  email?: string
  signature?: string        // '/uploads/sig.png'
  signatureUrl?: string     // alternative key
}
const props = defineProps<{ employees: Emp[] }>()

/** ---- vee-validate inline rules (no Yup) ---- */
defineRule('required', (value: any) => {
  if (value === undefined || value === null || value === '') return 'This field is required'
  return true
})
// ensure Employee B differs from Employee A
defineRule('differentFromA', (value: any, _params: any, ctx: any) => {
  if (!value) return true
  if (ctx?.form?.employeeA && value === ctx.form.employeeA) {
    return 'Employees must be different'
  }
  return true
})

/** Form state */
const employeeA = ref<string>('')
const employeeB = ref<string>('')

/** Lookups & previews */
const imgs = ref<(ImageBitmap | null)[]>([null, null])
const preview = ref<(string | null)[]>([null, null])
const result = ref<{ matchPercent: number; fgA: number; fgB: number; intersection: number } | null>(null)
const diffCanvas = ref<HTMLCanvasElement | null>(null)

/** Tunables */
const WIDTH = 600
const HEIGHT = 200
const BLUR_PX = 0.7
const USE_OTSU = true
const FIXED_THRESHOLD_0_255 = 180

const thresholdMode = computed(() => (USE_OTSU ? 'Auto (Otsu)' : `Fixed ${FIXED_THRESHOLD_0_255}`))

/** Helpers */
function keyOf(e: Emp) { return e.id ?? e.email ?? e.name }
function urlOf(e: Emp | null) { return e?.signature ?? e?.signatureUrl ?? null }
function empByKey(key: string | number | null | undefined) {
  if (!key) return null
  return props.employees.find(e => keyOf(e) === key) ?? null
}

async function loadSignatureBitmap(url: string) {
  const res = await fetch(url, { cache: 'no-cache' })
  if (!res.ok) throw new Error(`Failed to load image: ${url}`)
  const blob = await res.blob()
  return await createImageBitmap(blob)
}

/** Watch selections and load bitmaps */
watch(employeeA, async (val) => {
  imgs.value[0] = null; preview.value[0] = null
  const e = empByKey(val); const url = urlOf(e)
  if (!url) return
  try { imgs.value[0] = await loadSignatureBitmap(url); preview.value[0] = url } catch (err) { console.error(err) }
})

watch(employeeB, async (val) => {
  imgs.value[1] = null; preview.value[1] = null
  const e = empByKey(val); const url = urlOf(e)
  if (!url) return
  try { imgs.value[1] = await loadSignatureBitmap(url); preview.value[1] = url } catch (err) { console.error(err) }
})

/** Submit -> run comparison */
async function handleSubmit() {
  await compare()
}

async function compare() {
  if (!imgs.value[0] || !imgs.value[1]) return
  const { bin: binA, rgba: rgbaA } = await preprocessToBinary(imgs.value[0]!, WIDTH, HEIGHT)
  const { bin: binB, rgba: rgbaB } = await preprocessToBinary(imgs.value[1]!, WIDTH, HEIGHT)

  const { dice, fgA, fgB, intersection } = diceOnBinary(binA, binB)
  result.value = { matchPercent: dice * 100, fgA, fgB, intersection }

  await nextTick()
  if (diffCanvas.value) {
    const out = new ImageData(WIDTH, HEIGHT)
    pixelmatch(rgbaA.data, rgbaB.data, out.data, WIDTH, HEIGHT, { threshold: 0.0, includeAA: false })
    diffCanvas.value.width = WIDTH
    diffCanvas.value.height = HEIGHT
    diffCanvas.value.getContext('2d')!.putImageData(out, 0, 0)
  }
}

/** draw->grayscale->blur->threshold->binary + RGBA mask */
async function preprocessToBinary(img: ImageBitmap, w: number, h: number): Promise<{ bin: Uint8Array; rgba: ImageData }> {
  const c = document.createElement('canvas')
  c.width = w; c.height = h
  const ctx = c.getContext('2d')!

  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h)

  const scale = Math.min(w / img.width, h / img.height)
  const dw = img.width * scale, dh = img.height * scale
  const dx = (w - dw) / 2, dy = (h - dh) / 2

  ctx.save()
  ctx.filter = `blur(${BLUR_PX}px)`
  ctx.drawImage(img, dx, dy, dw, dh)
  ctx.restore()

  const rgba = ctx.getImageData(0, 0, w, h)
  const gray = new Uint8Array(w * h)
  for (let i = 0, j = 0; i < rgba.data.length; i += 4, j++) {
    const r = rgba.data[i], g = rgba.data[i + 1], b = rgba.data[i + 2]
    gray[j] = (0.299 * r + 0.587 * g + 0.114 * b) | 0
  }

  const thr = USE_OTSU ? otsu(gray) : FIXED_THRESHOLD_0_255
  const bin = new Uint8Array(w * h)
  for (let i = 0; i < gray.length; i++) bin[i] = gray[i] < thr ? 1 : 0

  const mask = new Uint8ClampedArray(w * h * 4)
  for (let i = 0, j = 0; i < bin.length; i++, j += 4) {
    const v = bin[i] ? 0 : 255
    mask[j] = v; mask[j + 1] = v; mask[j + 2] = v; mask[j + 3] = 255
  }
  const maskRGBA = new ImageData(mask, w, h)
  return { bin, rgba: maskRGBA }
}

/** Otsu auto-threshold */
function otsu(gray: Uint8Array): number {
  const hist = new Uint32Array(256)
  for (let i = 0; i < gray.length; i++) hist[gray[i]]++
  const total = gray.length

  let sum = 0
  for (let t = 0; t < 256; t++) sum += t * hist[t]

  let sumB = 0, wB = 0, maxVar = -1, threshold = 127
  for (let t = 0; t < 256; t++) {
    wB += hist[t]
    if (wB === 0) continue
    const wF = total - wB
    if (wF === 0) break

    sumB += t * hist[t]
    const mB = sumB / wB
    const mF = (sum - sumB) / wF
    const betweenVar = wB * wF * (mB - mF) * (mB - mF)
    if (betweenVar > maxVar) { maxVar = betweenVar; threshold = t }
  }
  return threshold
}

/** Dice coefficient for binary masks */
function diceOnBinary(a: Uint8Array, b: Uint8Array) {
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
</script>

<style scoped>
/* minimal styles; adjust as needed */
</style>
