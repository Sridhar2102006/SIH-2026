import fs from 'fs';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/sridh/.gemini/antigravity-ide/brain/376452b6-17d5-4aab-a736-3c8277087e84';

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function test() {
  const res = await fetch('http://localhost:9222/json');
  const targets = await res.json();
  const pageTarget = targets.find(t => t.url.includes('5173'));
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);
  let id = 1;
  const send = (method, params = {}) => new Promise(resolve => {
    const curId = id++;
    const handler = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.id === curId) {
        ws.removeEventListener('message', handler);
        resolve(msg.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: curId, method, params }));
  });

  const evalCode = async (code) => {
    const result = await send('Runtime.evaluate', {
      expression: code,
      returnByValue: true
    });
    return result.result?.value;
  };

  // Ensure full hash modal is closed
  await evalCode(`(() => {
    const closeBtn = document.querySelector('.public-hash-modal-close-btn');
    if (closeBtn) closeBtn.click();
  })()`);
  await delay(400);

  // Click About HoneyChain
  await evalCode(`(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('About HoneyChain'));
    if (btn) btn.click();
  })()`);
  await delay(600);

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(
    path.join(ARTIFACTS_DIR, 'screen28_10_about_honeychain_modal.png'),
    Buffer.from(shot.data, 'base64')
  );
  console.log('Successfully captured screen28_10_about_honeychain_modal.png');

  ws.close();
}

test().catch(console.error);
