import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/sridh/.gemini/antigravity-ide/brain/376452b6-17d5-4aab-a736-3c8277087e84';
const EDGE_PATH = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const PORT = 9222;

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function run() {
  const edge = spawn(EDGE_PATH, [
    `--remote-debugging-port=${PORT}`,
    '--headless=new',
    '--window-size=430,932',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    'about:blank'
  ]);

  await delay(1500);

  try {
    const res = await fetch(`http://127.0.0.1:${PORT}/json`);
    const targets = await res.json();
    const pageTarget = targets.find(t => t.type === 'page');

    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
    let idCounter = 1;
    const pending = new Map();

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.id && pending.has(msg.id)) {
          pending.get(msg.id)(msg);
          pending.delete(msg.id);
        }
      } catch (e) {}
    };

    const send = (method, params = {}) => {
      const id = idCounter++;
      return new Promise((resolve) => {
        pending.set(id, resolve);
        ws.send(JSON.stringify({ id, method, params }));
      });
    };

    await new Promise(r => ws.onopen = r);
    await send('Page.enable');
    await send('Runtime.enable');

    await send('Page.navigate', { url: 'http://localhost:5173/' });
    await delay(3500);

    // Scroll to bottom of Home
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const scroll = document.querySelector('.hv-scroll');
          if (scroll) scroll.scrollTop = 900;
        })()
      `
    });
    await delay(1000);

    const shot = await send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(shot.result.data, 'base64');
    fs.writeFileSync(path.join(ARTIFACTS_DIR, 'screen14_home_bottom_verified.png'), buffer);
    console.log('Saved screen14_home_bottom_verified.png');

    ws.close();
  } catch (err) {
    console.error(err);
  } finally {
    edge.kill();
  }
}

run();
