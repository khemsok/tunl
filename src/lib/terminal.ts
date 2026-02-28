import { unblockSites } from "./blocker";

function destroyRenderer(): void {
  const renderer = (globalThis as any).__tunl_renderer;
  if (renderer) {
    try { renderer.destroy(); } catch {}
    (globalThis as any).__tunl_renderer = null;
  }
  process.stdout.write("\x1b[?25h\x1b[?1000l\x1b[?1002l\x1b[?1003l\x1b[?1006l\x1b[?1049l");
}

export function registerCleanup(): void {
  const cleanup = () => {
    destroyRenderer();
    try { unblockSites(); } catch {}
    process.exit(0);
  };

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
  process.on("exit", destroyRenderer);
  process.on("uncaughtException", (err) => {
    destroyRenderer();
    try { unblockSites(); } catch {}
    console.error(err);
    process.exit(1);
  });
}
