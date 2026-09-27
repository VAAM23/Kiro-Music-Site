import { createCanvasLoop } from "./canvas-fx.mjs";

// Two or three layered sine waves, each with its own amplitude, wavelength,
// speed and blue -> cyan / purple gradient, drawn with a soft glow. Positive
// speed values scroll the pattern from right to left.
const LAYERS = [
  {
    amplitude: 0.16,
    wavelength: 260,
    speed: 46,
    phase: 0,
    from: "#4659b1",
    to: "#58d7ef",
    lineWidth: 3,
    opacity: 0.9,
    glow: 16,
  },
  {
    amplitude: 0.24,
    wavelength: 190,
    speed: 32,
    phase: 2.1,
    from: "#7c5cff",
    to: "#33d1ff",
    lineWidth: 2,
    opacity: 0.55,
    glow: 14,
  },
  {
    amplitude: 0.32,
    wavelength: 360,
    speed: 20,
    phase: 4.4,
    from: "#33d1ff",
    to: "#b7a2ee",
    lineWidth: 7,
    opacity: 0.16,
    glow: 22,
  },
];

function drawLayer(ctx, layer, width, height, time) {
  const midY = height * 0.52;
  const amplitude = height * layer.amplitude;
  const step = Math.max(6, width / 140);
  const gradient = ctx.createLinearGradient(0, 0, width, 0);
  gradient.addColorStop(0, layer.from);
  gradient.addColorStop(1, layer.to);

  ctx.beginPath();
  for (let x = 0; x <= width; x += step) {
    const angle =
      (x / layer.wavelength) * Math.PI * 2 +
      time * (layer.speed / layer.wavelength) * Math.PI * 2 +
      layer.phase;
    const y = midY + Math.sin(angle) * amplitude;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = gradient;
  ctx.lineWidth = layer.lineWidth;
  ctx.globalAlpha = layer.opacity;
  ctx.shadowColor = layer.to;
  ctx.shadowBlur = layer.glow;
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
}

export function initHeroWave(canvas) {
  return createCanvasLoop(canvas, (ctx, { width, height, time }) => {
    ctx.clearRect(0, 0, width, height);
    for (const layer of LAYERS) drawLayer(ctx, layer, width, height, time);
  });
}
