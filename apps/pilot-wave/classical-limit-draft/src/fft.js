// In-place radix-2 complex FFT. Forward sign is negative; inverse includes 1/N.
// Plans are shared by both axes, so resets do not rebuild trigonometric tables.
const plans = new Map();
export function fftPlan(size) {
  if (plans.has(size)) return plans.get(size);
  if (size < 2 || (size & (size - 1))) throw new RangeError('FFT size must be a power of two.');
  const reverse = new Uint32Array(size);
  const cos = new Float64Array(size / 2);
  const sin = new Float64Array(size / 2);
  const bits = Math.log2(size);
  for (let i = 0; i < size; i++) {
    let n = i, r = 0;
    for (let j = 0; j < bits; j++) { r = (r << 1) | (n & 1); n >>>= 1; }
    reverse[i] = r;
  }
  for (let i = 0; i < size / 2; i++) {
    cos[i] = Math.cos(2 * Math.PI * i / size);
    sin[i] = Math.sin(2 * Math.PI * i / size);
  }
  const plan = { size, transform(re, im, inverse = false) {
    for (let i = 0; i < size; i++) {
      const j = reverse[i];
      if (j > i) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; }
    }
    for (let width = 2; width <= size; width *= 2) {
      const half = width / 2, stride = size / width;
      for (let base = 0; base < size; base += width) {
        for (let j = 0; j < half; j++) {
          const a = base + j, b = a + half, k = j * stride;
          const wr = cos[k], wi = inverse ? sin[k] : -sin[k];
          const tr = wr * re[b] - wi * im[b], ti = wr * im[b] + wi * re[b];
          re[b] = re[a] - tr; im[b] = im[a] - ti;
          re[a] += tr; im[a] += ti;
        }
      }
    }
    if (inverse) for (let i = 0; i < size; i++) { re[i] /= size; im[i] /= size; }
  } };
  plans.set(size, plan);
  return plan;
}
