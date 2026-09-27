// Shared canvas animation loop used by the hero wave and hero background
// effects. Centralizes DPR handling, resize, tab-visibility pausing and
// prefers-reduced-motion so each effect only has to provide a draw function.
export function createCanvasLoop(canvas, draw) {
  const noop = { start() {}, stop() {} };
  if (!(canvas instanceof HTMLCanvasElement) || typeof draw !== "function")
    return noop;
  const ctx = canvas.getContext("2d");
  if (!ctx) return noop;

  const reduceMotionQuery = window.matchMedia?.(
    "(prefers-reduced-motion: reduce)",
  );
  let width = 0;
  let height = 0;
  let rafId = 0;
  let running = false;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(1, Math.round(rect.width || canvas.clientWidth || 1));
    height = Math.max(1, Math.round(rect.height || canvas.clientHeight || 1));
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function renderFrame(time) {
    draw(ctx, { width, height, time });
  }

  function loop(timestampMs) {
    renderFrame(timestampMs / 1000);
    rafId = requestAnimationFrame(loop);
  }

  function start() {
    if (running) return;
    running = true;
    resize();
    if (reduceMotionQuery?.matches) {
      renderFrame(0);
      return;
    }
    rafId = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(rafId);
  }

  const handleResize = () => {
    resize();
    if (!running || reduceMotionQuery?.matches) renderFrame(0);
  };

  const resizeObserver =
    typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(handleResize)
      : null;
  if (resizeObserver) resizeObserver.observe(canvas);
  else window.addEventListener("resize", handleResize);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });

  reduceMotionQuery?.addEventListener?.("change", () => {
    stop();
    start();
  });

  resize();
  start();

  return { start, stop };
}
