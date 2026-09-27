import fs from 'fs';

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function run() {
  const res = await fetch('http://localhost:9222/json');
  const targets = await res.json();
  const page = targets.find(t => t.url.includes('5173'));
  if (!page) {
    console.error('No page target on port 5173 found!');
    return;
  }
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

  const screenshot = async (filename) => {
    const data = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(`scripts/${filename}`, Buffer.from(data.data, 'base64'));
    console.log(`Saved screenshot: scripts/${filename}`);
  };

  const evalCode = async (expr) => {
    const res = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
    return res?.result?.value;
  };

  // 1. Navigate to Home
  console.log('1. Navigating to #home...');
  await evalCode(`window.location.hash = '#home';`);
  await sleep(600);
  await screenshot('beekeeper_01_quiet_dashboard.png');

  // 2. Open Attention Popup
  console.log('2. Opening Attention details popup...');
  await evalCode(`document.querySelector('.bk-ab-action-btn')?.click();`);
  await sleep(400);
  await screenshot('beekeeper_02_attention_popup.png');

  // 3. Close Attention Popup, Open Notebook Popup
  console.log('3. Opening Field Notebook popup...');
  await evalCode(`document.querySelector('.bk-close-btn')?.click();`);
  await sleep(300);
  await evalCode(`
    const links = Array.from(document.querySelectorAll('.bk-sec-link'));
    const nbLink = links.find(l => l.innerText.includes('Notebook'));
    nbLink?.click();
  `);
  await sleep(400);
  await screenshot('beekeeper_03_notebook_popup.png');

  // 4. Close Notebook, Open Summary Details Popup
  console.log('4. Opening Summary details popup...');
  await evalCode(`document.querySelector('.bk-close-btn')?.click();`);
  await sleep(300);
  await evalCode(`document.querySelector('.bk-qh-metric-chip')?.click();`);
  await sleep(400);
  await screenshot('beekeeper_04_summary_popup.png');

  // 5. Navigate to Inspections
  console.log('5. Navigating to #inspections...');
  await evalCode(`document.querySelector('.bk-close-btn')?.click();`);
  await sleep(300);
  await evalCode(`window.location.hash = '#inspections';`);
  await sleep(600);
  await screenshot('beekeeper_05_inspections_styled_pills.png');

  // 6. Test filter pills click
  console.log('6. Clicking AI Scans filter pill...');
  await evalCode(`
    const pills = Array.from(document.querySelectorAll('.bk-filter-pill'));
    const scanPill = pills.find(p => p.innerText.includes('AI Scans'));
    scanPill?.click();
  `);
  await sleep(300);
  await screenshot('beekeeper_06_inspections_ai_scans_filter.png');

  console.log('7. Clicking Routine filter pill...');
  await evalCode(`
    const pills = Array.from(document.querySelectorAll('.bk-filter-pill'));
    const routPill = pills.find(p => p.innerText.includes('Routine'));
    routPill?.click();
  `);
  await sleep(300);
  await screenshot('beekeeper_07_inspections_routine_filter.png');

  // 8. Click All, then click first card to open InspectionDetailModal
  console.log('8. Opening Inspection detail popup...');
  await evalCode(`
    const pills = Array.from(document.querySelectorAll('.bk-filter-pill'));
    const allPill = pills.find(p => p.innerText.includes('All'));
    allPill?.click();
  `);
  await sleep(300);
  await evalCode(`document.querySelector('.bk-insp-event-card')?.click();`);
  await sleep(400);
  await screenshot('beekeeper_08_inspection_detail_popup.png');

  ws.close();
  console.log('Verification completed successfully!');
}

run().catch(console.error);
