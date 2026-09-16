// Optional shared presentation tools. Models supply canvas layers and playback hooks.
export function mountQonticMedia({stage, controls, getCanvases, beginRecording = () => {}, endRecording = () => {}, filename = 'qontic-simulation'}) {
  if (!document.querySelector('link[data-qontic-media]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet'; link.href = new URL('./qontic-media.css?v=1', import.meta.url);
    link.dataset.qonticMedia = ''; document.head.append(link);
  }
  const toolbar = document.createElement('div'); toolbar.className = 'qontic-media-toolbar';
  toolbar.innerHTML = '<button type="button" aria-expanded="false">⛶ Expand Simulation</button><button type="button">● Record Video</button>';
  const [expand, record] = toolbar.children;
  stage.prepend(toolbar);
  const expanded = document.createElement('dialog'); expanded.className = 'qontic-expanded-dialog';
  expanded.setAttribute('aria-label', 'Expanded simulation'); document.body.append(expanded);
  let home, controlHome, attributes;
  const setExpanded = value => {
    if (value === expanded.open) return;
    if (value) {
      home = document.createComment('Simulation position'); stage.replaceWith(home);
      if (controls) {
        controlHome = document.createComment('Playback position'); controls.replaceWith(controlHome);
        attributes = ['show-tabs','show-interpretation'].map(name => [name,controls.getAttribute(name)]);
        controls.setAttribute('show-tabs','false'); controls.setAttribute('show-interpretation','false');
        expanded.append(controls);
      }
      expanded.append(stage); expanded.showModal();
    } else {
      expanded.close(); home.replaceWith(stage);
      if (controls) {
        controlHome.replaceWith(controls);
        for (const [name, value] of attributes) value === null ? controls.removeAttribute(name) : controls.setAttribute(name,value);
      }
    }
    expand.textContent = value ? '↙ Restore View' : '⛶ Expand Simulation';
    expand.setAttribute('aria-expanded', String(value)); expand.focus();
    window.dispatchEvent(new Event('resize'));
  };
  expand.addEventListener('click', () => setExpanded(!expanded.open));
  expanded.addEventListener('cancel', event => { event.preventDefault(); setExpanded(false); });
  const dialog = document.createElement('dialog'); dialog.className = 'qontic-record-dialog';
  dialog.setAttribute('aria-label','Record video');
  dialog.innerHTML = `<div class="qontic-record-heading"><h2>Record video</h2><button type="button" data-close aria-label="Close recording settings">✕</button></div>
    <label>Resolution<select data-size><option value="1280">1280 px wide</option><option value="1920">1920 px wide</option></select></label>
    <label>Length (seconds)<input data-duration type="number" min="1" max="120" step="1" value="10"></label>
    <p>Records the current simulation as it runs, up to 30 fps. Controls stay out of the video. Keep this tab visible while recording.</p>
    <button type="button" data-start>Start recording</button>
    <progress hidden max="1" value="0" aria-label="Recording progress"></progress>
    <p role="status" aria-live="polite"></p><video controls hidden aria-label="Recorded simulation preview"></video><a hidden data-download>Save video</a>`;
  document.body.append(dialog);
  const start = dialog.querySelector('[data-start]'), status = dialog.querySelector('[role=status]');
  const duration = dialog.querySelector('[data-duration]'), size = dialog.querySelector('[data-size]');
  const progress = dialog.querySelector('progress'), download = dialog.querySelector('a'), preview = dialog.querySelector('video');
  const supported = typeof MediaRecorder !== 'undefined' && typeof HTMLCanvasElement.prototype.captureStream === 'function';
  let recorder, stream, frame, timeout, url, token, captureCanvas, recording = false;
  const stop = () => { if (recording && recorder?.state === 'recording') recorder.stop(); };
  const close = () => { stop(); dialog.close(); };
  record.addEventListener('click', () => { dialog.showModal(); if (!supported) status.textContent = 'Video recording is unavailable in this browser.'; });
  dialog.querySelector('[data-close]').addEventListener('click', close);
  dialog.addEventListener('cancel', event => { event.preventDefault(); event.stopPropagation(); close(); });
  dialog.addEventListener('keydown', event => event.stopPropagation());
  start.disabled = !supported;
  const cleanup = () => {
    cancelAnimationFrame(frame); clearTimeout(timeout); stream?.getTracks().forEach(track => track.stop()); captureCanvas?.remove();
    if (recording) endRecording(token);
    recording = false; record.textContent = '● Record Video'; start.textContent = 'Start recording';
    start.disabled = !supported; duration.disabled = size.disabled = false; progress.hidden = true;
  };
  start.addEventListener('click', async () => {
    if (recording) { stop(); return; }
    if (!duration.reportValidity()) return;
    try {
      const layers = getCanvases().filter(canvas => {const r=canvas.getBoundingClientRect();return r.width>0 && r.height>0;});
      if (!layers.length) throw new Error('Open the simulation view before recording.');
      const bounds = layers.map(c => c.getBoundingClientRect());
      const left = Math.min(...bounds.map(r=>r.left)), top = Math.min(...bounds.map(r=>r.top));
      const width = Math.max(...bounds.map(r=>r.right))-left, height = Math.max(...bounds.map(r=>r.bottom))-top;
      const output = document.createElement('canvas'); captureCanvas = output; output.style.cssText = 'display:block;width:100%;max-height:220px;object-fit:contain;margin-top:8px'; preview.before(output); output.width = +size.value;
      output.height = Math.max(2, 2*Math.round(output.width*height/width/2));
      const ctx = output.getContext('2d');
      const draw = () => {
        ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--bg-primary').trim() || '#0f172a';
        ctx.fillRect(0,0,output.width,output.height);
        layers.forEach((canvas,i) => { const r=bounds[i];ctx.drawImage(canvas,(r.left-left)*output.width/width,(r.top-top)*output.height/height,r.width*output.width/width,r.height*output.height/height); });
      };
      draw(); stream = output.captureStream(0); const captureTrack = stream.getVideoTracks()[0];
      const mimeType = ['video/webm;codecs=vp8','video/webm;codecs=vp9','video/webm','video/mp4'].find(type=>MediaRecorder.isTypeSupported(type));
      if (!mimeType) throw new Error('No supported video format is available.');
      recorder = new MediaRecorder(stream,{mimeType,videoBitsPerSecond:6000000});
      const chunks=[];
      recorder.ondataavailable = event => { if(event.data.size) chunks.push(event.data); };
      recorder.onstop = () => {
        cleanup();
        if (chunks.reduce((sum,chunk)=>sum+chunk.size,0)<256) {status.textContent='No video frames were recorded. Please try again.';return;}
        if (url) URL.revokeObjectURL(url);
        url = URL.createObjectURL(new Blob(chunks,{type:mimeType}));
        download.href = preview.src = url;
        download.download = filename + '-' + new Date().toISOString().replace(/[:.]/g,'-') + (mimeType.includes('mp4')?'.mp4':'.webm');
        download.hidden = preview.hidden = false;
        status.textContent = 'Ready — preview or save your video.';
      };
      recorder.onerror = event => { cleanup(); status.textContent = 'Recording failed: ' + (event.error?.message || 'browser error'); };
      token = await beginRecording(); recording = true;
      size.disabled = duration.disabled = true; download.hidden = preview.hidden = true;
      progress.hidden = false; progress.value = 0; start.textContent = 'Stop and save'; record.textContent = '● Recording…';
      status.textContent = 'Recording the live simulation…';
      const began=performance.now(), length=Number(duration.value)*1000;
      let last=0;
      const tick = now => {if(!recording)return;if(now-last>=1000/30){draw();captureTrack.requestFrame();last=now;progress.value=Math.min(1,(now-began)/length);}frame=requestAnimationFrame(tick);};
      recorder.start(); draw(); captureTrack.requestFrame(); frame=requestAnimationFrame(tick); timeout=setTimeout(stop,length);
    } catch(error) { cleanup(); status.textContent = 'Recording failed: ' + error.message; }
  });
  window.addEventListener('pagehide',()=>{stop();if(url)URL.revokeObjectURL(url);});
  return {setExpanded, stopRecording:stop};
}
