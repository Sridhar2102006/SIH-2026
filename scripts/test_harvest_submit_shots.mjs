import fs from 'fs';

async function stepHarvestAndSubmit() {
  const res = await fetch('http://localhost:9222/json');
  const targets = await res.json();
  const page = targets.find(t => t.url.includes('5173'));
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);
  let id = 1;
  const send = (method, params = {}) => new Promise((resolve) => {
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

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const saveShot = async (name) => {
    const snap = await send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(snap.data, 'base64');
    fs.writeFileSync(`scripts/${name}.png`, buffer);
    console.log(`Saved scripts/${name}.png`);
  };

  const evalCode = async (expression) => {
    const r = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    return r.result?.value;
  };

  // Currently HarvestModal is open on Step 1
  console.log('1. Advancing HarvestModal to Step 2...');
  await evalCode(`document.querySelector('.bk-modal-overlay .bk-next-btn')?.click()`);
  await sleep(400);

  console.log('2. Advancing HarvestModal to Step 3 (Confirmation)...');
  await evalCode(`document.querySelector('.bk-modal-overlay .bk-next-btn')?.click()`);
  await sleep(500);

  console.log('Capturing beekeeper_13_harvest_confirm...');
  await saveShot('beekeeper_13_harvest_confirm');

  console.log('3. Closing HarvestModal...');
  await evalCode(`document.querySelector('.bk-modal-overlay .bk-close-btn')?.click()`);
  await sleep(400);

  console.log('4. Opening SubmitToProcessorModal...');
  await evalCode(`
    const subBtn = Array.from(document.querySelectorAll('.bk-action-callout button, .bk-hcard-action')).find(b => b.textContent.includes('Submit for Processing') || b.textContent.includes('Submit to Processor'));
    if (subBtn) subBtn.click();
  `);
  await sleep(600);

  console.log('Capturing beekeeper_14_submit_processor_modal...');
  await saveShot('beekeeper_14_submit_processor_modal');

  console.log('5. Closing SubmitToProcessorModal...');
  await evalCode(`document.querySelector('.bk-modal-overlay .bk-close-btn')?.click()`);
  await sleep(400);

  process.exit(0);
}

stepHarvestAndSubmit();
