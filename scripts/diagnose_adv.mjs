import { spawn } from 'child_process';

const EDGE_PATH = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const PORT = 9397;

async function run() {
  const edge = spawn(EDGE_PATH, [
    `--remote-debugging-port=${PORT}`,
    '--headless=new',
    '--window-size=430,932',
    `--user-data-dir=C:/Users/sridh/AppData/Local/Temp/edge_diag2_${Date.now()}`,
    'http://localhost:5173/'
  ]);
  await new Promise((r) => setTimeout(r, 2000));
  const res = await fetch(`http://127.0.0.1:${PORT}/json`);
  const [t] = await res.json();
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  let id = 1;
  const send = (m, p) =>
    new Promise((resolve) => {
      const curId = id++;
      const handler = (e) => {
        const msg = JSON.parse(e.data);
        if (msg.id === curId) {
          ws.removeEventListener('message', handler);
          resolve(msg.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: curId, method: m, params: p }));
    });

  await send('Page.enable');
  await send('Runtime.enable');
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data);
    if (m.method === 'Runtime.consoleAPICalled' || m.method === 'Runtime.exceptionThrown') {
      console.log('BROWSER LOG:', JSON.stringify(m.params));
    }
  });

  await send('Runtime.evaluate', {
    expression: `localStorage.setItem('honeychain_user_session', JSON.stringify({ isAuthenticated: true, isOnboardingComplete: true }));`
  });
  await send('Page.navigate', { url: 'http://localhost:5173/' });
  await new Promise((r) => setTimeout(r, 6000));

  const checkBefore = await send('Runtime.evaluate', {
    expression: `JSON.stringify({
      hasFn: typeof window.__openTechnicalProof,
      text: document.body.innerText.substring(0, 200),
      hasContent: Boolean(document.querySelector('.app-content'))
    })`
  });
  console.log('Before open:', checkBefore.result.value);

  await send('Runtime.evaluate', {
    expression: `window.__openTechnicalProof({ batchId: 'batch-hc-2409', scenario: 'confirmed' });`
  });
  await new Promise((r) => setTimeout(r, 1000));

  const checkAfter = await send('Runtime.evaluate', {
    expression: `JSON.stringify({
      hasOverlay: Boolean(document.querySelector('.tech-screen-overlay')),
      hasBtn: Boolean(document.querySelector('.tech-advanced-toggle-btn')),
      text: document.body.innerText.substring(0, 300)
    })`
  });
  console.log('After open:', checkAfter.result.value);

  console.log('Checking advBtn...');
  const resBtn = await send('Runtime.evaluate', {
    expression: `(() => {
      const b = document.querySelector('.tech-advanced-toggle-btn');
      if (!b) return 'NO BUTTON';
      b.click();
      return 'CLICKED OK';
    })()`
  });
  console.log('Click result:', resBtn);

  await new Promise((r) => setTimeout(r, 1000));
  const status = await send('Runtime.evaluate', {
    expression: `document.querySelector('.tech-screen-overlay') ? 'OVERLAY PRESENT' : 'OVERLAY GONE'`
  });
  console.log('Status after click:', status);

  const rect = await send('Runtime.evaluate', {
    expression: `(() => {
      const p = document.querySelector('.tech-advanced-panel');
      if (!p) return 'NO PANEL';
      const r = p.getBoundingClientRect();
      return JSON.stringify({ top: r.top, height: r.height, bottom: r.bottom });
    })()`
  });
  console.log('Panel rect:', rect);

  edge.kill();
  process.exit(0);
}

run();
