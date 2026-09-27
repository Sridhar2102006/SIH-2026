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

  // 1. Ensure HC-2409 is set
  await evalCode(`(() => {
    if (window.__setPublicVerificationScenario) {
      window.__setPublicVerificationScenario('HC-2409', false);
    }
  })()`);
  await delay(800);

  // 2. Click proof toggle
  const clickedToggle = await evalCode(`(() => {
    const toggle = document.querySelector('.public-proof-toggle-btn');
    if (toggle) {
      toggle.click();
      return true;
    }
    return false;
  })()`);
  console.log('Clicked toggle:', clickedToggle);
  await delay(800);

  // 3. Click expand button
  const clickedExpand = await evalCode(`(() => {
    const expand = document.querySelector('.public-hash-expand-btn');
    if (expand) {
      expand.click();
      return true;
    }
    return false;
  })()`);
  console.log('Clicked expand:', clickedExpand);
  await delay(800);

  // 4. Capture screenshot
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(
    path.join(ARTIFACTS_DIR, 'screen28_09_full_hash_modal.png'),
    Buffer.from(shot.data, 'base64')
  );
  console.log('Successfully captured screen28_09_full_hash_modal.png');

  ws.close();
}

test().catch(console.error);
