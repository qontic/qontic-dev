import { createExperiment, sceneKey } from './experiments.js';
import { Renderer, TrailHistory } from './renderer.js';
import { paintPhaseLegend, phaseLegendLayout } from './phase-legend.js';

export const EXPORT_FPS = 30;
export const EXPORT_WIDTHS = [1920, 2560];
const yieldToUI = () => new Promise(resolve => setTimeout(resolve, 0));

// The video clock is defined by frame numbers, never by wall time or rAF.
// A separate experiment keeps exports independent of live playback and resize.
export async function renderVideo({ settings, appearance, view, width = 2560, duration = 10,
  startTime = 0, displayWidth = 1062, signal, onProgress = () => {}, onPreview = () => {}, onFrame }) {
  if (!EXPORT_WIDTHS.includes(width) || !Number.isFinite(duration) || duration < 1 || duration > 120
    || !Number.isFinite(startTime) || startTime < 0) throw new Error('Choose a video length from 1 to 120 seconds.');
  if (typeof VideoEncoder === 'undefined') throw new Error('Video export needs WebCodecs. Open this page in Chrome or Edge.');
  const checkCancelled = () => { if (signal?.aborted) throw new DOMException('Export cancelled', 'AbortError'); };
  checkCancelled();
  onProgress({ stage: 'Preparing', completed: 0, total: Math.round(duration * EXPORT_FPS) });
  const { Output, BufferTarget, Mp4OutputFormat, WebMOutputFormat, CanvasSource, Quality, canEncodeVideo } = await import('./vendor/media.js');
  const height = width * 5 / 8, total = Math.round(duration * EXPORT_FPS);
  const bitrate = Math.round(80000000 * (width / 3840) ** 2);
  const quality = new Quality({ bitrate });
  let codec;
  for (const candidate of ['avc', 'vp9']) {
    if (await canEncodeVideo(candidate, { width, height, quality })) { codec = candidate; break; }
  }
  if (!codec) throw new Error('This browser cannot encode the selected resolution. Try a smaller video size.');
  checkCancelled();
  const canvas = document.createElement('canvas');
  canvas.className = 'export-preview'; canvas.setAttribute('aria-label', 'Video render preview');
  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = width; outputCanvas.height = height;
  const context = outputCanvas.getContext('2d', { alpha: false, colorSpace: 'srgb' });
  const { scale: legendScale, margin } = phaseLegendLayout(displayWidth, width);
  const legend = paintPhaseLegend(document.createElement('canvas'), legendScale);
  const legendMargin = Math.round(margin);
  // A current-time export respects the most recent trail toggle. A fresh launch
  // starts its trails at zero along with its separately reconstructed wave.
  const trailStartTime = startTime > 0 ? Math.min(startTime, Math.max(0, appearance.trailStartTime || 0)) : 0;
  let renderer, experiment, output;
  const report = { width, height, fps: EXPORT_FPS, frames: 0, duration: total / EXPORT_FPS,
    startTime, trailStartTime, playback: appearance.playback, codec, bitrate, scene: sceneKey(settings.obstacle), settings: { ...settings } };
  try {
    renderer = new Renderer(canvas);
    const gl = renderer.gl;
    // Render extra samples spatially, then downsample once before encoding.
    const scale = 2;
    renderer.recordingSize = [Math.round(width * scale), Math.round(height * scale)];
    const limit = Math.min(gl.getParameter(gl.MAX_TEXTURE_SIZE), gl.getParameter(gl.MAX_RENDERBUFFER_SIZE));
    if (renderer.recordingSize.some(n => n > limit)) throw new Error('This GPU needs a smaller video size.');
    renderer.recordingScale = renderer.recordingSize[0] / Math.max(600, displayWidth);
    renderer.outputPixelScale = scale;
    renderer.center = [...view.center]; renderer.zoom = view.zoom;
    renderer.resize();
    if (gl.drawingBufferWidth !== canvas.width || gl.drawingBufferHeight !== canvas.height) throw new Error('This GPU cannot allocate the video surface. Try a smaller size.');
    report.renderSize = [...renderer.recordingSize];
    canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); });
    experiment = createExperiment(gl, settings);
    const history = new TrailHistory(experiment.count);
    if (appearance.showTrails && trailStartTime === 0) history.append(0, experiment.positions);
    onPreview(canvas);
    let steps = 0;
    const advance = async target => {
      while (experiment.time < target - 1e-10) {
        checkCancelled();
        if (gl.isContextLost()) throw new Error('The graphics context was lost during export. Try a smaller video size.');
        const nextTime = Math.min(target, experiment.time + 1 / 120);
        experiment.evaluate(experiment.time < trailStartTime ? Math.min(nextTime, trailStartTime) : nextTime);
        if (appearance.showTrails && experiment.time >= trailStartTime) history.append(experiment.time, experiment.positions);
        if (++steps % 16 === 0) await yieldToUI();
      }
    };
    await advance(startTime);
    const target = new BufferTarget();
    const format = codec === 'avc' ? new Mp4OutputFormat({ fastStart: 'in-memory' }) : new WebMOutputFormat();
    output = new Output({ format, target });
    const source = new CanvasSource(outputCanvas, { codec, quality, latencyMode: 'quality',
      keyFrameInterval: 2, contentHint: 'detail',
      onEncodedPacket: () => { report.frames++; },
      onEncoderConfig: config => { report.encoderConfig = config; } });
    output.addVideoTrack(source, { frameRate: EXPORT_FPS });
    await output.start();
    context.imageSmoothingEnabled = true; context.imageSmoothingQuality = 'high';
    for (let frame = 0; frame < total; frame++) {
      checkCancelled();
      await advance(startTime + frame * appearance.playback / EXPORT_FPS);
      renderer.render(experiment, history, appearance, true);
      if (gl.isContextLost() || gl.getError() !== gl.NO_ERROR) throw new Error('The GPU could not render a video frame. Try a smaller video size.');
      context.drawImage(canvas, 0, 0, width, height);
      context.drawImage(legend, width - legend.width - legendMargin, height - legend.height - legendMargin);
      await onFrame?.(outputCanvas, frame, experiment.diagnostics());
      await source.add(frame / EXPORT_FPS, 1 / EXPORT_FPS);
      onProgress({ stage: 'Rendering', completed: frame + 1, total });
      await yieldToUI();
    }
    checkCancelled();
    onProgress({ stage: 'Finishing', completed: total, total });
    await output.finalize();
    checkCancelled();
    if (report.frames !== total) throw new Error(`Video encoder returned ${report.frames} of ${total} frames.`);
    report.finalState = experiment.diagnostics();
    return { blob: new Blob([target.buffer], { type: codec === 'avc' ? 'video/mp4' : 'video/webm' }),
      extension: codec === 'avc' ? 'mp4' : 'webm', report };
  } finally {
    if (output && output.state !== 'finalized' && output.state !== 'canceled') await output.cancel().catch(() => {});
    if (experiment?.is2D && renderer?.gl.isContextLost()) experiment.contextLost = true;
    experiment?.dispose?.(); renderer?.dispose();
    // Release the large drawing buffers and context instead of accumulating them.
    renderer?.gl.getExtension('WEBGL_lose_context')?.loseContext();
    canvas.remove(); canvas.width = 1; canvas.height = 1;
    outputCanvas.width = 1; outputCanvas.height = 1;
  }
}
