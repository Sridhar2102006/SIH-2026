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
    process.exit(1);
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
    console.log(`[CDP] Saved screenshot: scripts/${filename}`);
  };

  const evalCode = async (expr) => {
    const res = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
    return res?.result?.value;
  };

  console.log('\n=== RUNNING BEEKEEPER E2E GOLDEN PATH & FAILURE TESTS ===\n');

  // 1. Direct URL Security Test: Navigate to unauthorized route #processing
  console.log('1. Testing Direct URL Access on unauthorized #processing...');
  await evalCode(`
    window.location.hash = '#processing';
    window.dispatchEvent(new Event('hashchange'));
  `);
  await sleep(1000);
  const is403 = await evalCode(`Boolean(document.querySelector('.access-denied-badge'))`);
  console.log('403 Forbidden Badge Visible:', is403);
  await screenshot('e2e_01_access_denied_processing.png');

  // 2. Return to Authorized Workspace
  console.log('2. Returning to Authorized Workspace...');
  await evalCode(`document.querySelector('.access-return-btn')?.click();`);
  await sleep(500);

  // 3. Open Register Frame Modal and test Duplicate Collision
  console.log('3. Testing Frame Registration & Collision Prevention...');
  await evalCode(`
    const btn = Array.from(document.querySelectorAll('.bk-ac-title')).find(el => el.innerText.includes('Register Frame'));
    btn?.closest('button')?.click();
  `);
  await sleep(400);

  // Try to submit duplicate frame number '3' on H001 (AP1H001F3 already exists)
  await evalCode(`
    const frameInput = document.querySelector('input[placeholder="e.g. 1, 2, 3..."]');
    if (frameInput) {
      frameInput.value = '3';
      frameInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
  `);
  await sleep(300);
  await evalCode(`
    const submitBtn = Array.from(document.querySelectorAll('.btn-primary')).find(b => b.innerText.includes('Register & Place'));
    submitBtn?.click();
  `);
  await sleep(500);
  await screenshot('e2e_02_duplicate_frame_rejected.png');

  // Close modal
  await evalCode(`document.querySelector('.bk-close-btn')?.click();`);
  await sleep(300);

  // 4. Open Workstation and Run AI Health Inspection
  console.log('4. Testing Optical Workstation AI Health Inspection...');
  await evalCode(`
    const scanBtn = Array.from(document.querySelectorAll('.bk-ac-title')).find(el => el.innerText.includes('Scan Comb'));
    scanBtn?.closest('button')?.click();
  `);
  await sleep(500);

  // Trigger explicit single capture
  await evalCode(`
    const captureBtn = document.querySelector('.bk-ws-capture-btn') || Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Capture'));
    captureBtn?.click();
  `);
  await sleep(500);

  // Run AI analysis
  await evalCode(`
    const analyzeBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Analyze') || b.innerText.includes('Screen'));
    analyzeBtn?.click();
  `);
  await sleep(1600);
  await screenshot('e2e_03_workstation_inspection_saved.png');

  // Close workstation
  await evalCode(`document.querySelector('.bk-ws-close-btn, .bk-close-btn')?.click();`);
  await sleep(400);

  // 5. Open Harvest Modal
  console.log('5. Testing Harvest Workflow...');
  await evalCode(`
    const hrvBtn = Array.from(document.querySelectorAll('.bk-ac-title')).find(el => el.innerText.includes('Harvest'));
    hrvBtn?.closest('button')?.click();
  `);
  await sleep(500);
  await screenshot('e2e_04_harvest_modal.png');

  // Close harvest modal
  await evalCode(`document.querySelector('.bk-close-btn')?.click();`);
  await sleep(300);

  // 6. Navigate to Honey Journey
  console.log('6. Testing Honey Journey Traceability...');
  await evalCode(`
    window.location.hash = '#journey';
    window.dispatchEvent(new Event('hashchange'));
  `);
  await sleep(800);
  await screenshot('e2e_05_honey_journey_traceability.png');

  // 7. Navigate to Inspections
  console.log('7. Testing Field Inspections Log & Timeline...');
  await evalCode(`
    window.location.hash = '#inspections';
    window.dispatchEvent(new Event('hashchange'));
  `);
  await sleep(800);
  await screenshot('e2e_06_hive_history_timeline.png');

  ws.close();
  console.log('\n=== E2E GOLDEN PATH COMPLETED SUCCESSFULLY ===\n');
}

run().catch(err => {
  console.error('E2E Run Error:', err);
  process.exit(1);
});
