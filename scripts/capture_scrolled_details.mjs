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
  const saveShot = async (name) => {
    const snap = await send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(snap.data, 'base64');
    fs.writeFileSync(`scripts/${name}.png`, buffer);
    console.log(`Saved scripts/${name}.png`);
  };

  // 1. Package Serialization View Scrolled
  console.log('1. Loading Package Tab with Scrolled Jar List...');
  await send('Page.reload');
  await sleep(2200);
  await send('Runtime.evaluate', {
    expression: `
      window.__openProductQrManagement({ batchId: 'batch-hc-2409', packageId: 'PKG-0042' });
    `
  });
  await sleep(600);
  await send('Runtime.evaluate', {
    expression: `
      const overlay = document.querySelector('.product-qr-overlay');
      if (overlay) overlay.scrollTop = 580;
    `
  });
  await sleep(400);
  await saveShot('screen30_05_package_serialization_view');

  // 2. Technical Details Accordion Scrolled
  console.log('2. Loading Batch View with Expanded Technical Details...');
  await send('Page.reload');
  await sleep(2200);
  await send('Runtime.evaluate', {
    expression: `
      window.__openProductQrManagement({ batchId: 'batch-hc-2409' });
    `
  });
  await sleep(600);
  await send('Runtime.evaluate', {
    expression: `
      const toggle = document.querySelector('.pqr-tech-toggle');
      if (toggle) toggle.click();
      const overlay = document.querySelector('.product-qr-overlay');
      if (overlay) overlay.scrollTop = 750;
    `
  });
  await sleep(400);
  await saveShot('screen30_09_technical_specifications');

  ws.close();
  console.log('Done!');
}

run().catch(console.error);
