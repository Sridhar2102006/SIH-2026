import fs from 'fs';

async function run() {
  const res = await fetch('http://localhost:9222/json');
  const targets = await res.json();
  const page = targets.find(t => t.url.includes('5173'));
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);
  let id = 1;
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const curId = id++;
    const handler = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.id === curId) {
        ws.removeEventListener('message', handler);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: curId, method, params }));
  });

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  console.log('Testing Screen 28 -> Screen 29 round trip loop...');
  // Click "Look up" button on Screen 28 header
  await send('Runtime.evaluate', {
    expression: `
      const lookupBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Look up'));
      if (lookupBtn) lookupBtn.click();
    `
  });
  await sleep(400);

  // Click "Scan Product QR Code" inside the lookup modal
  await send('Runtime.evaluate', {
    expression: `
      const scanBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Scan Product QR Code'));
      if (scanBtn) scanBtn.click();
    `
  });
  await sleep(600);

  const check = await send('Runtime.evaluate', {
    expression: `({
      hasScanner: Boolean(document.querySelector('.product-scanner-overlay')),
      scannerTitle: document.querySelector('.scanner-title')?.textContent
    })`,
    returnByValue: true
  });
  console.log('Scanner reopened from Screen 28:', check?.result?.value);

  const snap = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scripts/screen29_09_reopened_from_screen28.png', Buffer.from(snap.data, 'base64'));
  console.log('Saved scripts/screen29_09_reopened_from_screen28.png');

  ws.close();
}

run().catch(console.error);
