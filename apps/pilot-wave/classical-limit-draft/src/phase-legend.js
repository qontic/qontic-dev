const WIDTH = 168, HEIGHT = 148;

export function phaseLegendLayout(displayWidth, outputWidth = displayWidth) {
  const scale = outputWidth / Math.max(600, displayWidth);
  return { scale, width: WIDTH * scale, height: HEIGHT * scale, margin: 16 * scale };
}

// Match the phase colours in renderer.js before density/visibility shading.
function phaseColor(phase) {
  const magnitude = Math.abs(phase), halfPi = 1.57079633;
  const branch = phase >= 0 ? [0.08, 0.25, 1] : [1, 0.08, 0.02];
  const blend = Math.max(0, Math.min(1, (magnitude - halfPi) / halfPi));
  const t = Math.min(1, magnitude / 1.05), visibility = t ** 3 * (t * (6 * t - 15) + 10);
  return branch.map((v, i) => (v + ([0.72, 0.04, 0.88][i] - v) * blend) * visibility);
}

export function paintPhaseLegend(canvas, scale = 2) {
  canvas.width = Math.round(WIDTH * scale); canvas.height = Math.round(HEIGHT * scale);
  const ctx = canvas.getContext('2d'), sx = canvas.width / WIDTH, sy = canvas.height / HEIGHT;
  ctx.setTransform(sx, 0, 0, sy, 0, 0);
  ctx.fillStyle = 'rgba(8, 11, 21, 0.94)'; ctx.strokeStyle = '#333b53'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(.5, .5, WIDTH - 1, HEIGHT - 1, 8); ctx.fill(); ctx.stroke();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = '11px system-ui, sans-serif'; ctx.fillStyle = '#c5c4d9';
  ctx.fillText('Wave phase', 84, 15);

  const wheel = document.createElement('canvas'), diameter = 66;
  wheel.width = wheel.height = Math.ceil(diameter * Math.max(sx, sy));
  const wheelContext = wheel.getContext('2d'), pixels = wheelContext.createImageData(wheel.width, wheel.height);
  const pixelScale = wheel.width / diameter;
  for (let y = 0; y < wheel.height; y++) for (let x = 0; x < wheel.width; x++) {
    const dx = (x + .5) / pixelScale - 33, dy = (y + .5) / pixelScale - 33;
    const radius = Math.hypot(dx, dy);
    const coverage = Math.max(0, Math.min(1, (31 - radius) * pixelScale + .5, (radius - 18) * pixelScale + .5));
    if (!coverage) continue;
    const color = phaseColor(Math.atan2(-dy, dx)), i = 4 * (y * wheel.width + x);
    for (let c = 0; c < 3; c++) pixels.data[i + c] = Math.round(255 * color[c]);
    pixels.data[i + 3] = Math.round(255 * coverage);
  }
  wheelContext.putImageData(pixels, 0, 0); ctx.drawImage(wheel, 51, 41, diameter, diameter);
  ctx.strokeStyle = '#626d85'; ctx.lineWidth = .6;
  for (const radius of [18, 31]) { ctx.beginPath(); ctx.arc(84, 74, radius, 0, 2 * Math.PI); ctx.stroke(); }
  ctx.fillStyle = '#bcc3d5'; ctx.font = '12px system-ui, sans-serif';
  ctx.fillText('+π/2', 84, 32); ctx.fillText('−π/2', 84, 117);
  ctx.fillText('±π', 29, 74); ctx.fillText('0', 137, 74);
  ctx.font = 'italic 17px Georgia, serif'; ctx.fillStyle = '#9299b2'; ctx.fillText('φ', 84, 74);
  ctx.font = '10px system-ui, sans-serif'; ctx.fillStyle = '#9299b2';
  ctx.fillText('Black can mean phase 0', 84, 137);
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'Wave phase: zero is black, positive pi over two is blue, negative pi over two is red, and plus or minus pi is magenta. Darkness can indicate phase, even with nonzero probability density.');
  return canvas;
}
