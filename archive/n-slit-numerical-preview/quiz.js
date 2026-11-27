// Quiz tab for the numerical N-slit preview: predict before you watch (shared module).
// Each question puts the app in a paused state (window.qonticNSlitQuiz, main.js) and
// shows a still schematic drawn here, so the running simulation cannot give the
// answer away. This app shows the pilot-wave account; the questions say so.
import { mountQonticQuiz } from "../../../shared/qontic-quiz.js?v=9";

const light = () => document.documentElement.classList.contains("qontic-light");
const app = () => window.qonticNSlitQuiz;

// Schematic: source on the left, wall with N slits, screen on the right.
// slits: 'open' | 'closed' | 'detector'. Options: absorbing wall, shutter (slit
// index being closed), packet (wavefronts past the wall), arrow (a particle
// heading for the wall between two slits), spectrum (crossing colours at the wall).
function drawSetup(canvas, slits, { absorbing = false, shutter = null, packet = false, arrow = false, spectrum = false } = {}) {
  const g = canvas.getContext("2d"), W = canvas.width, H = canvas.height, isLight = light();
  const ink = isLight ? "#16324a" : "#d8ecf5", dim = isLight ? "#6b8796" : "#7f9cab";
  g.fillStyle = isLight ? "#eef4f8" : "#16293a"; g.fillRect(0, 0, W, H);
  const wallX = 150, screenX = 318, n = slits.length, gap = Math.min(40, 220 / n), pitch = Math.min(70, 260 / Math.max(1, n - 1));
  const centre = k => H / 2 + (k - (n - 1) / 2) * pitch;
  const grad = g.createRadialGradient(34, H / 2, 2, 34, H / 2, 40);
  grad.addColorStop(0, isLight ? "rgba(8,116,135,.8)" : "rgba(129,231,245,.9)"); grad.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grad; g.fillRect(0, H / 2 - 50, 80, 100);
  g.fillStyle = dim; g.font = "11px Inter, system-ui, sans-serif"; g.textAlign = "center"; g.fillText("source", 34, H / 2 + 58);
  g.strokeStyle = isLight ? "rgba(8,116,135,.35)" : "rgba(129,231,245,.35)"; g.lineWidth = 2;
  for (let x = 70; x < wallX - 10; x += 16) { g.beginPath(); g.moveTo(x, H / 2 - 120); g.lineTo(x, H / 2 + 120); g.stroke(); }
  // wall
  g.strokeStyle = absorbing ? "#8a5a2b" : ink; g.lineWidth = absorbing ? 12 : 6; g.beginPath(); let y = 14;
  const openings = slits.map((s, k) => [centre(k) - gap / 2, centre(k) + gap / 2, s, k]);
  for (const [top, bottom, s] of openings) { if (s === "closed") continue; g.moveTo(wallX, y); g.lineTo(wallX, top); y = bottom; }
  g.moveTo(wallX, y); g.lineTo(wallX, H - 14); g.stroke();
  if (absorbing) { g.fillStyle = dim; g.font = "11px Inter, system-ui, sans-serif"; g.textAlign = "center"; g.fillText("absorbing wall", wallX, H - 2); }
  const specColor = t => `hsl(${250 - 190 * t}, 80%, ${45 + 15 * t}%)`;
  for (const [top, bottom, s, k] of openings) {
    g.fillStyle = dim; g.font = "12px Inter, system-ui, sans-serif"; g.textAlign = "right";
    g.fillText(String(k + 1), wallX + 26, (top + bottom) / 2 + 4);
    if (s === "detector") {
      g.fillStyle = "#ffd54a"; g.strokeStyle = "#3b2d00"; g.lineWidth = 1.5;
      g.fillRect(wallX - 24, (top + bottom) / 2 - 10, 14, 20); g.strokeRect(wallX - 24, (top + bottom) / 2 - 10, 14, 20);
      g.fillStyle = "#3b2d00"; g.font = "bold 11px Inter, system-ui, sans-serif"; g.textAlign = "center"; g.fillText("D", wallX - 17, (top + bottom) / 2 + 4);
    }
    if (shutter === k) {
      g.strokeStyle = "#e66767"; g.lineWidth = 6; g.setLineDash([4, 3]); g.beginPath(); g.moveTo(wallX, top); g.lineTo(wallX, bottom); g.stroke(); g.setLineDash([]);
      g.fillStyle = "#e66767"; g.font = "11px Inter, system-ui, sans-serif"; g.textAlign = "left"; g.fillText("closing", wallX + 8, bottom + 14);
    }
    if (spectrum && s !== "closed") {
      for (let i = 0; i < 6; i++) {
        const yy = top + (i + 0.5) * (bottom - top) / 6, t = (yy - centre(0) + gap / 2) / (centre(n - 1) - centre(0) + gap);
        g.fillStyle = specColor(t); g.beginPath(); g.arc(wallX + 10, yy, 2.6, 0, 2 * Math.PI); g.fill();
      }
    }
  }
  if (packet) {
    g.strokeStyle = isLight ? "rgba(8,116,135,.45)" : "rgba(129,231,245,.45)"; g.lineWidth = 2;
    for (const [top, bottom, s] of openings) {
      if (s === "closed") continue;
      for (let r = 18; r <= 66; r += 12) { g.beginPath(); g.arc(wallX, (top + bottom) / 2, r, -Math.PI / 2.6, Math.PI / 2.6); g.stroke(); }
    }
  }
  if (arrow) {
    const yy = (centre(0) + centre(1)) / 2;
    g.fillStyle = "#ff4d4d"; g.beginPath(); g.arc(wallX - 52, yy, 6, 0, 2 * Math.PI); g.fill();
    g.strokeStyle = "#ff4d4d"; g.lineWidth = 2; g.beginPath(); g.moveTo(wallX - 44, yy); g.lineTo(wallX - 14, yy); g.stroke();
    g.beginPath(); g.moveTo(wallX - 14, yy); g.lineTo(wallX - 22, yy - 5); g.lineTo(wallX - 22, yy + 5); g.closePath(); g.fillStyle = "#ff4d4d"; g.fill();
  }
  g.strokeStyle = ink; g.lineWidth = 3; g.beginPath(); g.moveTo(screenX, 14); g.lineTo(screenX, H - 14); g.stroke();
  g.fillStyle = dim; g.font = "11px Inter, system-ui, sans-serif"; g.textAlign = "center"; g.fillText("screen", screenX, H - 2);
}

export function mountNumericalQuiz({ panel, tab, simulationTab }) {
  const questions = [
    {
      question: "Two slits, a detector at slit 2 (Pilot Wave). What pattern builds up on the screen?",
      caption: "Two open slits; a detector records particles passing slit 2.",
      plain: "No fringes: the sum of the two single-slit patterns.",
      answers: [
        { id: "fringes", label: "The usual two-slit fringes" },
        { id: "sum", label: "No fringes: the two single-slit patterns added" },
        { id: "one", label: "Only the pattern of slit 1" },
      ],
      answer: "sum",
      explain: "The detector's record is entangled with the slit: one record for slit 2, another for 'no detector fired' (slit 1). The two parts of the wave carry different records, so they no longer interfere, and the density behind the wall is |ψ₁|² + |ψ₂|². In this app each record has its own wave behind the wall; checked against two single-slit runs, the pattern agrees to about 4%. In pilot-wave terms the particle's slit fixes its record, and it is guided by that record's wave; the other is an empty wave.",
      prepare: () => app()?.setTo({ slits: ["open", "detector"] }),
      draw: c => drawSetup(c, ["open", "detector"]),
    },
    {
      question: "Three slits, a detector at slit 1 only (Pilot Wave). What does the screen show?",
      caption: "Three open slits; the detector is at slit 1.",
      plain: "Slit 1's single-slit pattern, plus two-slit fringes from slits 2 and 3.",
      answers: [
        { id: "none", label: "No fringes at all" },
        { id: "mixed", label: "Slit 1's pattern plus fringes from slits 2 and 3" },
        { id: "three", label: "The full three-slit fringes" },
      ],
      answer: "mixed",
      explain: "There are two records: 'slit 1' and 'no detector fired'. In the second, slits 2 and 3 are not told apart, so their waves still interfere. The density is |ψ₁|² + |ψ₂ + ψ₃|²: a broad single-slit hump from slit 1 under the two-slit fringes of slits 2 and 3. More detectors mean less interference.",
      prepare: () => app()?.setTo({ slits: ["detector", "open", "open"] }),
      draw: c => drawSetup(c, ["detector", "open", "open"]),
    },
    {
      question: "Two slits. Slit 2 is closed at once (reflecting blade) as the packet centre reaches the wall. What happens to the part of the wave that had already passed?",
      caption: "The packet is crossing the wall; slit 2 is being closed.",
      plain: "That part is unchanged, but the wave around it changes: later parts, changed by the closing, spread into the same region.",
      answers: [
        { id: "same", label: "Unchanged, and so is the wave in that region" },
        { id: "spread", label: "Unchanged, but the wave in that region changes" },
        { id: "instant", label: "It is changed at once by the closing" },
      ],
      answer: "spread",
      explain: "The Schrödinger equation is linear, and the part already past the wall does not reach the slit again: closing it leaves that part unchanged (by well under 1% in a reference calculation). But the part still in front of the wall or inside the slit is changed, and it does not stay behind: the spread of speeds in the packet, diffraction to wide angles and scattering at the blade carry it forward. Ahead of the cut the total wave changes by about half with this short packet, and the particles there are guided by the total wave. Watch it with 'show change' on: the app draws ψ − ψ(slit left open).",
      prepare: () => app()?.setTo({ slits: ["open", "open"], closeAtWall: 1, showChange: 1 }),
      draw: c => drawSetup(c, ["open", "open"], { shutter: 1, packet: true }),
      onWatch: () => { app()?.start(); setTimeout(() => app()?.closeSlit(1), 200); },
    },
    {
      question: "Reflecting wall, Pilot Wave. A particle heads straight for the wall between the two slits. What happens to it?",
      caption: "The red particle moves towards the wall between the slits.",
      plain: "It is turned away before it reaches the wall.",
      answers: [
        { id: "turned", label: "It is turned away before it reaches the wall" },
        { id: "through", label: "It goes through the wall" },
        { id: "stops", label: "It stops at the wall" },
      ],
      answer: "turned",
      explain: "The particle moves with the velocity given by the wave, (ħ/m)·Im(∇ψ/ψ). In front of the reflecting wall the incident and reflected waves overlap; the guidance turns the particle back or sideways, and it never enters the wall, where ψ is almost zero. Set the wall to Absorbing and particles that reach it are removed instead (an effective rule, with the probability that |ψ|² is absorbed there).",
      prepare: () => app()?.setTo({ slits: ["open", "open"], color: "updown" }),
      draw: c => drawSetup(c, ["open", "open"], { arrow: true }),
    },
    {
      question: "Five slits, particles coloured by the height at which they crossed the wall (Spectrum). How are the colours arranged on the screen?",
      caption: "Colour = height of the wall crossing, from blue (top) to yellow (bottom).",
      plain: "In order: blue at the top of the screen, yellow at the bottom.",
      answers: [
        { id: "ordered", label: "In order, blue at the top to yellow at the bottom" },
        { id: "mixed", label: "Mixed: every colour everywhere" },
        { id: "reversed", label: "Reversed: yellow at the top" },
      ],
      answer: "ordered",
      explain: "Pilot-wave trajectories in one wave never cross, so particles keep their order from the wall to the screen: the top of the screen is reached only by particles that crossed high. The bands they form follow the guidance flow; how many particles land in each follows from starting positions distributed as |ψ|². With detectors the order holds within each record's wave, not across records.",
      prepare: () => app()?.setTo({ slits: ["open", "open", "open", "open", "open"], color: "spectrum" }),
      draw: c => drawSetup(c, ["open", "open", "open", "open", "open"], { spectrum: true }),
    },
    {
      question: "Slit 2 is closed from the moment the packet centre reaches the wall. Which changes the wave ahead of the cut more: a blade that closes at once, or one that takes several packet transit times?",
      caption: "Same start time; the blade closes at once or slowly.",
      plain: "The instant closure: about half, against about a quarter for the slow blade.",
      answers: [
        { id: "fast", label: "The instant closure" },
        { id: "slow", label: "The slow blade" },
        { id: "neither", label: "Neither: nothing ahead of the cut changes" },
      ],
      answer: "fast",
      explain: "In the reference calculation the wave ahead of the cut changed by 52% for an instant reflecting blade and by 24% for a blade taking 60 time units (about three packet transit times). The slow blade scatters less, and more of the packet passes slit 2 before it closes. Neither leaves the region ahead unchanged: with this short packet, much of the wave found there later comes from parts that were still in front of the wall at the start. Try it: set the closing time and compare the stats with 'show change' on.",
      prepare: () => app()?.setTo({ slits: ["open", "open"], tau: 60, closeAtWall: 1, showChange: 1 }),
      draw: c => drawSetup(c, ["open", "open"], { shutter: 1, packet: true }),
      onWatch: () => { app()?.start(); setTimeout(() => app()?.closeSlit(1), 200); },
    },
  ];
  return mountQonticQuiz({
    panel, tab, simulationTab, questions, shuffle: true, score: true,
    intro: "This app shows the pilot-wave account: particles with positions, guided by the numerically computed wave.",
    onWatch: q => { if (q.onWatch) q.onWatch(); else app()?.start(); },
  });
}
