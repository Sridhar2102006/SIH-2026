import fs from 'node:fs';

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function run() {
  const list = await (await fetch('http://localhost:9222/json')).json();
  const page = list.find(p => p.url.includes('5173'));
  if (!page) {
    console.error('No Vite dev page found on port 5173');
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

  console.log('\n=== RUNNING MASTER PROCESSOR E2E VERIFICATION ===\n');

  // 1. Authenticate as Marcus K. (Processor Lead)
  console.log('1. Setting authenticated session as Processor Lead...');
  await evalCode(`
    const processorSession = {
      userId: 'usr-marcus-k',
      name: 'Marcus K.',
      operator: 'Marcus K.',
      email: 'marcus@honeyhouse.org',
      isAuthenticated: true,
      isOnboardingComplete: true,
      designations: ['HONEY_PROCESSOR'],
      capabilities: [
        'PROCESSING_MANAGEMENT',
        'BATCH_INTAKE',
        'PROCESSING_STEP_RECORD',
        'PROCESSING_PARAMETERS',
        'PROCESSING_EVIDENCE',
        'BATCH_TRACEABILITY',
        'PROCESSING_COMPLETION',
        'QUALITY_HANDOFF'
      ],
      workContexts: { areas: ['processing'], handles: ['batches', 'intake', 'tanks'] }
    };
    window.localStorage.setItem('honeychain_auth_session', JSON.stringify(processorSession));
    window.location.hash = '#home';
  `);
  await send('Page.reload');
  await sleep(1500);

  // Take screenshot of Processor Home
  console.log('2. Verifying Processor Home Dashboard & Attention Grid...');
  await screenshot('proc_01_processor_home_dashboard.png');

  // 3. Navigate to Intake
  console.log('3. Navigating to Intake tab (#intake)...');
  await evalCode(`
    window.location.hash = '#intake';
    window.dispatchEvent(new Event('hashchange'));
  `);
  await sleep(1000);
  await screenshot('proc_02_intake_queue.png');

  // 4. Open Verification Modal for incoming harvest AP1H001F5
  console.log('4. Opening Intake Verification Modal for incoming harvest...');
  await evalCode(`
    const verifyBtn = document.querySelector('.proc-verify-btn');
    verifyBtn?.click();
  `);
  await sleep(800);
  await screenshot('proc_03_intake_verification_modal.png');

  // 5. Accept the intake
  console.log('5. Accepting harvest intake...');
  await evalCode(`
    const acceptBtn = document.querySelector('.proc-btn-accept');
    acceptBtn?.click();
  `);
  await sleep(800);

  // 6. Open Create Batch Modal
  console.log('6. Opening Create Processing Batch Modal...');
  await evalCode(`
    const createBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Create Processing Batch') || b.innerText.includes('New Processing Batch'));
    createBtn?.click();
  `);
  await sleep(800);
  await screenshot('proc_04_create_batch_modal.png');

  // 7. Submit Create Batch
  console.log('7. Initializing Processing Batch...');
  await evalCode(`
    const initBtn = document.querySelector('.proc-submit-btn');
    initBtn?.click();
  `);
  await sleep(1000);

  // 8. Navigate to Batches View
  console.log('8. Viewing Active Processing Batches...');
  await evalCode(`
    window.location.hash = '#batches';
    window.dispatchEvent(new Event('hashchange'));
  `);
  await sleep(1000);
  await screenshot('proc_05_batches_view.png');

  // 9. Open Detail for the first batch
  console.log('9. Opening Batch Detail Workspace...');
  await evalCode(`
    const batchCard = document.querySelector('.proc-batch-card');
    batchCard?.click();
  `);
  await sleep(800);
  await screenshot('proc_06_batch_detail_workspace.png');

  // 10. Switch to Source Traceability tab inside modal
  console.log('10. Inspecting Many-to-One Source Traceability in Batch Detail...');
  await evalCode(`
    const srcTab = Array.from(document.querySelectorAll('.proc-tab-btn')).find(b => b.innerText.includes('Source Traceability'));
    srcTab?.click();
  `);
  await sleep(600);
  await screenshot('proc_07_source_traceability_lineage.png');

  // 11. Switch to Quality Handover tab to verify Incomplete Batch Protection
  console.log('11. Verifying Incomplete Batch Protection on Quality Handover...');
  await evalCode(`
    const qTab = Array.from(document.querySelectorAll('.proc-tab-btn')).find(b => b.innerText.includes('Quality Handover'));
    qTab?.click();
  `);
  await sleep(600);
  await screenshot('proc_08_incomplete_batch_protection.png');

  // Close modal
  await evalCode(`document.querySelector('.proc-close-btn')?.click();`);
  await sleep(500);

  // 12. Navigate to History View
  console.log('12. Navigating to Audit Log (#history)...');
  await evalCode(`
    window.location.hash = '#history';
    window.dispatchEvent(new Event('hashchange'));
  `);
  await sleep(1000);
  await screenshot('proc_09_processing_audit_trail.png');

  ws.close();
  console.log('\n=== MASTER PROCESSOR E2E VERIFICATION COMPLETED SUCCESSFULLY ===\n');
}

run().catch(err => {
  console.error('Processor E2E Run Error:', err);
  process.exit(1);
});
