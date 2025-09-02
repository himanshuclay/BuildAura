// controllers/signature.controller.js
const sharp = require('sharp')

// --- ESM/CJS interop shims ---
const pm = require('pixelmatch')
const pixelmatch = pm.default || pm

const ssimMod = require('ssim.js')
const ssimFn = (ssimMod.default?.ssim) ? ssimMod.default.ssim :
              (ssimMod.ssim) ? ssimMod.ssim :
              null
if (!ssimFn) throw new Error('Failed to load ssim.js – no ssim export found')

// Node 18+ has global fetch; if not, lazily polyfill:
const ensureFetch = async () => {
  if (typeof fetch === 'function') return fetch
  const { default: nodeFetch } = await import('node-fetch')
  return nodeFetch
}

// Tunables
const WIDTH = 600        // final comparison canvas
const HEIGHT = 200
const BLUR = 0.7         // gaussian blur sigma (de-noise)
const THRESH = 180       // binarization threshold (0..255)
const PM_THRESHOLD = 0.1 // pixelmatch sensitivity (0..1)
const PM_INCLUDE_AA = true

exports.compare = async (req, res) => {
  try {
    const { imageA, imageB } = req.body || {}
    if (!imageA || !imageB) {
      return res.status(400).json({ message: 'imageA and imageB (base64 or URL) are required.' })
    }

    // Convert inputs to buffers
    const bufA = await fetchToBuffer(imageA)
    const bufB = await fetchToBuffer(imageB)

    // ---- Preprocess & normalize (trim → contain on fixed canvas → RGBA raw) ----
    const preA = await preprocessAndNormalize(bufA, WIDTH, HEIGHT)
    const preB = await preprocessAndNormalize(bufB, WIDTH, HEIGHT)

    const expected = WIDTH * HEIGHT * 4
    if (preA.length !== expected || preB.length !== expected) {
      console.error('Unexpected buffer size', { a: preA.length, b: preB.length, expected })
      return res.status(500).json({ message: 'Internal image format error (channels mismatch).' })
    }

    // ---- SSIM (structure) ----
    const ssimScore = ssimFn(
      { data: new Uint8ClampedArray(preA), width: WIDTH, height: HEIGHT },
      { data: new Uint8ClampedArray(preB), width: WIDTH, height: HEIGHT }
    ).ssim

    // ---- Pixelmatch (diff image) ----
    const diff = Buffer.alloc(expected)
    const diffPixels = pixelmatch(preA, preB, diff, WIDTH, HEIGHT, {
      threshold: PM_THRESHOLD,
      includeAA: PM_INCLUDE_AA,
    })
    const totalPixels = WIDTH * HEIGHT
    const matchPercentAll = (1 - diffPixels / totalPixels) * 100

    // ---- Foreground-only match (ignore whitespace) ----
    const maskA = makeInkMask(preA) // Uint8Array of 0/1, length = WIDTH*HEIGHT
    const maskB = makeInkMask(preB)

    let unionInk = 0
    for (let i = 0; i < maskA.length; i++) {
      // union of ink pixels in A or B
      if ((maskA[i] | maskB[i]) === 1) unionInk++
    }
    // Avoid divide-by-zero: if no ink, consider 100% (both blank)
    const denom = Math.max(unionInk, 1)
    const matchPercentInk = (1 - (diffPixels / denom)) * 100

    // ---- Render diff RGBA -> PNG for preview ----
    const diffPng = await sharp(diff, { raw: { width: WIDTH, height: HEIGHT, channels: 4 } })
      .png()
      .toBuffer()

    res.json({
      // Prefer showing this:
      matchPercent: matchPercentInk,          // Foreground-only %
      // Extra diagnostics:
      matchPercentAll,                        // Background-inflated %
      ssimScore,                              // 0..1
      diffPixels,
      diffBase64: `data:image/png;base64,${diffPng.toString('base64')}`,
    })
  } catch (error) {
    console.error('Error compare signature:', error)
    res.status(500).json({ message: 'Server error while comparing signatures.' })
  }
}

// base64 data URL or remote URL -> Buffer
async function fetchToBuffer (input) {
  if (typeof input !== 'string') throw new Error('Invalid image input')
  if (input.startsWith('data:image/')) {
    return Buffer.from(input.split(',')[1], 'base64')
  }
  const f = await ensureFetch()
  const r = await f(input)
  if (!r.ok) throw new Error('Failed to fetch image from URL')
  const ab = await r.arrayBuffer()
  return Buffer.from(ab)
}

/**
 * Preprocess & normalize:
 * 1) Convert to sRGB
 * 2) Resize with white background (contain)
 * 3) De-noise & threshold (per-channel to avoid b-w color space)
 * 4) Trim surrounding white to focus on ink
 * 5) Place back onto fixed-size white canvas (contain) so both images share dims
 * 6) Ensure RGBA raw buffer
 */
async function preprocessAndNormalize (src, W, H) {
  // Stage 1: normalize colours, de-noise, threshold to get strong ink on white
  const stage1 = await sharp(src)
    .toColourspace('srgb')                              // keep in sRGB
    .resize(W, H, { fit: 'contain', background: '#ffffff' })
    .blur(BLUR)
    .threshold(THRESH, { grayscale: false })           // per-channel threshold -> stays sRGB
    .png()                                             // stay in a standard format for trim()
    .toBuffer()

  // Stage 2: trim white borders (top-left is white after stage1)
  const trimmed = await sharp(stage1)
    .trim(10)                                          // adjust tolerance if needed (0-255)
    .png()
    .toBuffer()

  // Stage 3: put trimmed content back onto a fixed W×H white canvas (contain)
  const normalized = await sharp(trimmed)
    .resize(W, H, { fit: 'contain', background: '#ffffff' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  return normalized.data // Uint8Array RGBA (W*H*4)
}

/**
 * Create a 0/1 mask indicating where "ink" exists.
 * Assumes RGBA raw buffer with white background and black strokes after threshold.
 * We look at the Red channel (or min of RGB) and mark ink for values < 128.
 */
function makeInkMask (rgba) {
  const mask = new Uint8Array(rgba.length / 4)
  for (let i = 0, j = 0; i < rgba.length; i += 4, j++) {
    const r = rgba[i]
    const g = rgba[i + 1]
    const b = rgba[i + 2]
    const v = Math.min(r, g, b) // darker = ink
    mask[j] = (v < 128) ? 1 : 0
  }
  return mask
}
