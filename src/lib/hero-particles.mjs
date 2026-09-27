import { createCanvasLoop } from "./canvas-fx.mjs";

// Cheap deterministic "randomness" so the pattern is stable across resizes
// and reduced-motion's single static frame, without needing to store state.
function pseudoRandom(seed) {
  const value = Math.sin(seed * 999) * 10000;
  return value - Math.floor(value);
}

const BAR_COUNT = 26;
const PARTICLE_COUNT = 20;

const bars = Array.from({ length: BAR_COUNT }, (_, index) => ({
  phase: (index / BAR_COUNT) * Math.PI * 2,
  speed: 0.5 + ((index * 37) % 10) / 10,
}));

const particles = Array.from({ length: PARTICLE_COUNT }, (_, index) => ({
  x: pseudoRandom(index * 13.37 + 1),
  y: pseudoRandom(index * 13.37 + 2),
  radius: 0.6 + pseudoRandom(index * 13.37 + 3) * 1.6,
  speed: 0.015 + pseudoRandom(index * 13.37 + 4) * 0.02,
  drift: (pseudoRandom(index * 13.37 + 5) - 0.5) * 0.08,
}));

function drawEqualizer(ctx, width, height, time) {
  const bandHeight = height * 0.24;
  const baseline = height * 0.92;
  const barWidth = width / BAR_COUNT;
  ctx.globalAlpha = 0.14;
  for (let index = 0; index < BAR_COUNT; index += 1) {
    const bar = bars[index];
    const barHeight =
      (Math.sin(time * bar.speed + bar.phase) * 0.5 + 0.5) * bandHeight + 4;
    const gradient = ctx.createLinearGradient(
      0,
      baseline,
      0,
      baseline - barHeight,
    );
    gradient.addColorStop(0, "#7c5cff");
    gradient.addColorStop(1, "#33d1ff");
    ctx.fillStyle = gradient;
    ctx.fillRect(
      index * barWidth + barWidth * 0.18,
      baseline - barHeight,
      barWidth * 0.64,
      barHeight,
    );
  }
  ctx.globalAlpha = 1;
}

function drawParticles(ctx, width, height, time) {
  ctx.globalAlpha = 0.45;
  ctx.fillStyle = "#68daf2";
  ctx.shadowColor = "#68daf2";
  ctx.shadowBlur = 6;
  for (const particle of particles) {
    const y = (((particle.y - time * particle.speed) % 1) + 1) % 1;
    const x =
      (((particle.x + Math.sin(time * 0.2 + particle.y * 6) * particle.drift) %
        1) +
        1) %
      1;
    ctx.beginPath();
    ctx.arc(x * width, y * height, particle.radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
}

export function initHeroBackground(canvas) {
  return createCanvasLoop(canvas, (ctx, { width, height, time }) => {
    ctx.clearRect(0, 0, width, height);
    drawEqualizer(ctx, width, height, time);
    drawParticles(ctx, width, height, time);
  });
}
