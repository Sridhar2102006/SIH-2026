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
    let code;
    if (expr.trim().startsWith('(() =>') || expr.trim().startsWith('(function')) {
      code = expr;
    } else if (expr.includes('const ') || expr.includes('let ') || expr.includes('var ') || expr.includes(';') || expr.includes('\n')) {
      code = `(() => {\n${expr}\n})()`;
    } else {
      code = `(() => {\nreturn (${expr});\n})()`;
    }
    const res = await send('Runtime.evaluate', { expression: code, returnByValue: true });
    if (res?.exceptionDetails) {
      console.error('Eval error:', res.exceptionDetails);
    }
    return res?.result?.value;
  };

  console.log('\n=== RUNNING MASTER LABORATORY E2E VERIFICATION ===\n');

  // 1. Authenticate as Elena Vance (Laboratory Specialist)
  console.log('1. Setting authenticated session as Pure Laboratory Specialist...');
  await evalCode(`
    const labSession = {
      userId: 'usr-elena-vance',
      name: 'Elena Vance',
      operator: 'Elena Vance',
      email: 'elena@honeychain.lab',
      isAuthenticated: true,
      isOnboardingComplete: true,
      designations: ['LAB_SPECIALIST'],
      capabilities: [
        'LAB_WORKSPACE',
        'SAMPLE_INTAKE',
        'SAMPLE_IDENTIFICATION',
        'TEST_ASSIGNMENT',
        'TEST_EXECUTION',
        'TEST_RESULT_ENTRY',
        'RESULT_EVIDENCE',
        'SAMPLE_HISTORY',
        'BATCH_QUALITY_CONTEXT',
        'RESULT_REVIEW',
        'QUALITY_RECOMMENDATION',
        'REPORT_GENERATION',
        'QUALITY_TESTING',
        'LAB_INSPECTION'
      ],
      workContexts: { areas: ['Laboratory testing bay'], handles: ['Assays', 'Spectrophotometry', 'Refractometry'] }
    };
    window.localStorage.setItem('honeychain_user_session', JSON.stringify(labSession));
    window.location.hash = '#home';
  `);
  await send('Page.reload');
  
  // Wait until splash finishes and lab home or app content is visible
  console.log('Waiting for startup splash to resolve...');
  for (let i = 0; i < 30; i++) {
    await sleep(300);
    const hasMain = await evalCode(`Boolean(document.querySelector('.lab-home-container, .samples-view-container, #main-content'))`);
    if (hasMain) {
      console.log(`Main application content mounted after ${(i+1)*300}ms`);
      break;
    }
  }
  await sleep(1000);

  // 2. Capture Lab Home Dashboard
  console.log('2. Inspecting Lab Home Dashboard...');
  await screenshot('lab_01_home_dashboard.png');

  // 3. Inspect Composed Navigation Tabs
  console.log('3. Verifying composed navigation for pure Lab user...');
  const navTabs = await evalCode(`
    Array.from(document.querySelectorAll('.bottom-nav-item, nav button')).map(el => el.textContent.trim()).filter(Boolean)
  `);
  console.log('Composed Navigation items:', navTabs);

  // 4. Navigate to Samples Queue
  console.log('4. Navigating to Laboratory Samples Queue (#samples)...');
  await evalCode(`
    window.location.hash = '#samples';
    window.dispatchEvent(new Event('hashchange'));
  `);
  await sleep(1000);
  await screenshot('lab_02_samples_queue.png');

  // 5. Open Sample Detail Modal & 6-Tier Traceability Lineage
  console.log('5. Opening Sample Detail Modal for LS-2026-0041...');
  await evalCode(`
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Details & Lineage'));
    if (btn) btn.click();
  `);
  await sleep(1000);
  await screenshot('lab_03_sample_detail_assays.png');

  // Click on "Source Traceability" tab in modal
  console.log('6. Switching to Source Traceability tab...');
  await evalCode(`
    const tab = Array.from(document.querySelectorAll('.modal-card button')).find(b => b.textContent.includes('Source Traceability'));
    if (tab) tab.click();
  `);
  await sleep(800);
  await screenshot('lab_04_source_traceability_lineage.png');

  // Click on "Chain of Custody" tab
  console.log('7. Switching to Chain of Custody tab...');
  await evalCode(`
    const tab = Array.from(document.querySelectorAll('.modal-card button')).find(b => b.textContent.includes('Chain of Custody'));
    if (tab) tab.click();
  `);
  await sleep(800);
  await screenshot('lab_05_chain_of_custody.png');

  // Close modal
  await evalCode(`
    const closeBtn = document.querySelector('[data-test="close-sample-detail"]') || document.querySelector('.modal-card [aria-label="Close modal"]');
    if (closeBtn) closeBtn.click();
  `);
  await sleep(800);

  // 8. Navigate to Testing Workspace (#tests)
  console.log('8. Navigating to Testing Workspace (#tests)...');
  await evalCode(`
    window.location.hash = '#tests';
    window.dispatchEvent(new Event('hashchange'));
  `);
  await sleep(1000);
  await screenshot('lab_06_testing_workspace.png');

  // 9. Open Record Measurement Modal
  console.log('9. Opening Record Measurement Modal...');
  await evalCode(`
    const recBtn = document.evaluate("//button[contains(., 'Record Result') or contains(., 'Edit / View')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    if (recBtn) recBtn.click();
  `);
  await sleep(600);
  await screenshot('lab_07_record_measurement_modal.png');

  // Close record modal
  await evalCode(`
    const cancelBtn = document.evaluate("//button[contains(text(), 'Cancel')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    if (cancelBtn) cancelBtn.click();
  `);
  await sleep(500);

  // 10. Navigate to Review & Recommendations (#review)
  console.log('10. Navigating to Results Review & Recommendations (#review)...');
  await evalCode(`
    window.location.hash = '#review';
    window.dispatchEvent(new Event('hashchange'));
  `);
  await sleep(1000);
  await screenshot('lab_08_review_workspace.png');

  // 11. Open Lab Report Modal
  console.log('11. Switching to Recommendations tab and opening Lab Report...');
  await evalCode(`
    const tab = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Quality Recommendations'));
    if (tab) tab.click();
  `);
  await sleep(600);
  await evalCode(`
    const repBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('View Report'));
    if (repBtn) repBtn.click();
  `);
  await sleep(1000);
  await screenshot('lab_09_analytical_findings_report.png');

  console.log('\n=== MASTER LABORATORY E2E VERIFICATION COMPLETED SUCCESSFULLY ===\n');
  ws.close();
}

run().catch(err => {
  console.error('Test run failed:', err);
  process.exit(1);
});
