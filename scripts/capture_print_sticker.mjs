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

  await send('Page.reload');
  await sleep(2200);
  await send('Runtime.evaluate', {
    expression: `
      window.__openProductQrManagement({ batchId: 'batch-hc-2409' });
    `
  });
  await sleep(600);

  // Click the Print label button using .pqr-row-btn
  await send('Runtime.evaluate', {
    expression: `
      const printBtn = Array.from(document.querySelectorAll('.pqr-row-btn')).find(b => b.textContent.includes('Print'));
      if (printBtn) printBtn.click();
    `
  });
  await sleep(500);

  await saveShot('screen30_06_printable_label_sticker');
  ws.close();
}

run();
