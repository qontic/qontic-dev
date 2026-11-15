const WIDTH = 168, HEIGHT = 148;

export function phaseLegendLayout(displayWidth, outputWidth = displayWidth) {
  const scale = outputWidth / Math.max(600, displayWidth);
  return { scale, width: WIDTH * scale, height: HEIGHT * scale, margin: 16 * scale };
}

// Position is a fraction of the space available around the inset.
export function phaseLegendPlacement(canvasWidth, canvasHeight, layout, position = { x: 1, y: 1 }) {
  const marginX = Math.min(layout.margin, Math.max(0, (canvasWidth - layout.width) / 2));
  const marginY = Math.min(layout.margin, Math.max(0, (canvasHeight - layout.height) / 2));
  const travelX = Math.max(0, canvasWidth - layout.width - 2 * marginX);
  const travelY = Math.max(0, canvasHeight - layout.height - 2 * marginY);
  return { left: marginX + travelX * position.x, top: marginY + travelY * position.y, travelX, travelY };
}

export function mountPhaseLegend(inset) {
  const host = inset.parentElement;
  const content = inset.querySelector('.phase-key-content');
  const toggle = inset.querySelector('.phase-key-toggle');
  const canvas = inset.querySelector('canvas');
  const position = { x: 1, y: 1 };
  let minimized = false, drag;
  paintPhaseLegend(canvas);
  content.setAttribute('aria-description', canvas.getAttribute('aria-label'));

  const layout = () => {
    const expanded = phaseLegendLayout(host.clientWidth);
    if (!minimized) return expanded;
    return { ...expanded, width: Math.min(44, host.clientWidth), height: Math.min(44, host.clientHeight) };
  };
  function placement(dimensions = layout()) {
    return phaseLegendPlacement(host.clientWidth, host.clientHeight, dimensions, position);
  }
  function update() {
    const dimensions = layout();
    const { left, top } = placement(dimensions);
    Object.assign(inset.style, {
      left: `${left}px`, top: `${top}px`, width: `${dimensions.width}px`, height: `${dimensions.height}px`,
    });
  }
  function move(from, dx, dy) {
    const { travelX, travelY } = placement();
    if (travelX > 0) position.x = Math.max(0, Math.min(1, from.x + dx / travelX));
    if (travelY > 0) position.y = Math.max(0, Math.min(1, from.y + dy / travelY));
    update();
  }
  toggle.addEventListener('click', () => {
    minimized = !minimized;
    content.hidden = minimized;
    inset.toggleAttribute('data-minimized', minimized);
    toggle.textContent = minimized ? 'φ' : '−';
    const label = minimized ? 'Restore wave phase inset' : 'Minimize wave phase inset';
    toggle.setAttribute('aria-label', label);
    toggle.title = label;
    toggle.setAttribute('aria-expanded', String(!minimized));
    update();
  });
  content.addEventListener('pointerdown', event => {
    if (event.button !== 0 || drag) return;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, position: { ...position } };
    content.setPointerCapture(event.pointerId);
  });
  content.addEventListener('pointermove', event => {
    if (drag?.id === event.pointerId) move(drag.position, event.clientX - drag.x, event.clientY - drag.y);
  });
  content.addEventListener('lostpointercapture', event => {
    if (drag?.id === event.pointerId) drag = null;
  });
  content.addEventListener('keydown', event => {
    const delta = { ArrowLeft: [-10, 0], ArrowRight: [10, 0], ArrowUp: [0, -10], ArrowDown: [0, 10] }[event.key];
    if (!delta && event.key !== 'Home') return;
    event.preventDefault();
    if (delta) move(position, ...delta);
    else {
      position.x = position.y = 1;
      update();
    }
  });
  return { update, exportState: () => ({ visible: !minimized, position: { ...position } }) };
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
