import fs from 'fs';

async function captureMissing() {
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

  // 1. Workstation Position & AI Result
  console.log('1. Navigating to Inspections...');
  await evalCode(`
    Array.from(document.querySelectorAll('.bottom-nav button')).find(b => b.textContent.includes('Inspections'))?.click()
  `);
  await sleep(600);

  console.log('2. Opening AI Workstation...');
  await evalCode(`
    Array.from(document.querySelectorAll('.bk-insp-btn, button')).find(b => b.textContent.includes('Bee Health Scan'))?.click()
  `);
  await sleep(600);
  console.log('Capturing beekeeper_10_workstation_position...');
  await saveShot('beekeeper_10_workstation_position');

  console.log('3. Capturing frame and analyzing in workstation...');
  await evalCode(`document.querySelector('.bk-ws-capture-btn')?.click()`);
  await sleep(500);
  await evalCode(`
    Array.from(document.querySelectorAll('.bk-ws-controls button')).find(b => b.textContent.includes('Analyze'))?.click()
  `);
  await sleep(1800);
  console.log('Capturing beekeeper_11_workstation_ai_result...');
  await saveShot('beekeeper_11_workstation_ai_result');

  console.log('4. Closing workstation...');
  await evalCode(`document.querySelector('.bk-modal-overlay .bk-close-btn')?.click()`);
  await sleep(400);

  // 2. Harvest Confirmation & Submit to Processor
  console.log('5. Navigating to Harvest tab...');
  await evalCode(`
    Array.from(document.querySelectorAll('.bottom-nav button')).find(b => b.textContent.includes('Harvest'))?.click()
  `);
  await sleep(600);

  console.log('6. Opening Record Harvest modal...');
  await evalCode(`
    Array.from(document.querySelectorAll('.bk-hcard-action')).find(b => b.textContent.includes('Record Harvest'))?.click()
  `);
  await sleep(600);

  console.log('7. Advancing to Step 2...');
  await evalCode(`document.querySelector('.bk-modal-overlay .bk-next-btn')?.click()`);
  await sleep(400);

  console.log('8. Advancing to Step 3 (Confirmation)...');
  await evalCode(`document.querySelector('.bk-modal-overlay .bk-next-btn')?.click()`);
  await sleep(500);
  console.log('Capturing beekeeper_13_harvest_confirm...');
  await saveShot('beekeeper_13_harvest_confirm');

  console.log('9. Closing Harvest modal...');
  await evalCode(`document.querySelector('.bk-modal-overlay .bk-close-btn')?.click()`);
  await sleep(400);

  console.log('10. Opening Submit to Processor modal...');
  await evalCode(`document.querySelector('.bk-action-callout button')?.click()`);
  await sleep(600);
  console.log('Capturing beekeeper_14_submit_processor_modal...');
  await saveShot('beekeeper_14_submit_processor_modal');

  console.log('11. Closing Submit modal...');
  await evalCode(`document.querySelector('.bk-modal-overlay .bk-close-btn')?.click()`);
  await sleep(400);

  console.log('ALL MISSING SHOTS CAPTURED SUCCESSFULLY!');
  process.exit(0);
}

captureMissing().catch(e => {
  console.error(e);
  process.exit(1);
});
