import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/sridh/.gemini/antigravity-ide/brain/376452b6-17d5-4aab-a736-3c8277087e84';
const EDGE_PATH = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const PORT = 9386;

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  console.log('Launching headless Edge for Screen 24 — Quality Check verification on port', PORT);
  const userDataDir = `C:/Users/sridh/AppData/Local/Temp/edge_sih_s24_${Date.now()}`;
  const edge = spawn(EDGE_PATH, [
    `--remote-debugging-port=${PORT}`,
    '--headless=new',
    '--window-size=430,932',
    '--disable-gpu',
    '--inprivate',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-fre',
    '--disable-sync',
    `--user-data-dir=${userDataDir}`,
    'http://localhost:5173/'
  ]);

  await delay(2500);

  try {
    const res = await fetch(`http://127.0.0.1:${PORT}/json`);
    const targets = await res.json();
    const pageTarget = targets.find((t) => t.type === 'page');
    if (!pageTarget) throw new Error('No page target found');

    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
    let idCounter = 1;
    const pending = new Map();

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.id && pending.has(msg.id)) {
          pending.get(msg.id)(msg);
          pending.delete(msg.id);
        }
      } catch (e) {}
    };

    const send = (method, params = {}) => {
      const id = idCounter++;
      return new Promise((resolve) => {
        pending.set(id, resolve);
        ws.send(JSON.stringify({ id, method, params }));
      });
    };

    await new Promise((r) => (ws.onopen = r));
    await send('Page.enable');
    await send('DOM.enable');

    console.log('Connected to CDP. Setting up authenticated user session...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const session = {
            operator: 'Sarah Lindqvist',
            apiary: 'Meadowbrook Apiary',
            designation: 'QUALITY',
            capabilities: ['HIVE_MONITORING', 'BATCH_CREATE', 'COLLECTION_VIEW', 'QUALITY_TESTING', 'QUALITY_VIEW', 'QUALITY_RECORD', 'QUALITY_APPROVE'],
            designations: ['PROCESSOR', 'QUALITY'],
            isAuthenticated: true,
            requiresVerification: false,
            isOnboardingComplete: true
          };
          localStorage.setItem('honeychain_user_session', JSON.stringify(session));
          location.reload();
        })()
      `
    });

    console.log('Waiting 4.5s for splash duration and main app mount...');
    await delay(4500);

    // Open Screen 24 — Quality Check for Batch HC-2409
    console.log('Opening Screen 24 — Quality Check for Batch HC-2409...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          if (window.__openQualityCheck) {
            window.__openQualityCheck({ qcId: 'qc-batch-hc-2409' });
          }
        })()
      `
    });
    await delay(1200);

    const isQcOpen = await send('Runtime.evaluate', {
      expression: `Boolean(document.querySelector('.qc-view-overlay'))`,
      returnByValue: true
    });
    console.log('Quality Check Overlay Open:', isQcOpen.result?.result?.value);

    // 1. Screenshot 1: Overview top with Ready for Review status, Batch Context, Stepper, Sample Record
    console.log('Taking screenshot 1: Top overview & required checks...');
    const shot1 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACTS_DIR, 'screen24_01_quality_check_overview.png'), Buffer.from(shot1.result.data, 'base64'));

    // Scroll down to view required checks, optional lab report and technical details
    await send('Runtime.evaluate', {
      expression: `
        const el = document.querySelector('.qc-body-scroll');
        if (el) el.scrollTop = 320;
      `
    });
    await delay(600);

    // Open Technical details accordion
    await send('Runtime.evaluate', {
      expression: `
        const btn = document.querySelector('.qc-tech-toggle-btn');
        if (btn) btn.click();
      `
    });
    await delay(600);

    // 2. Screenshot 2: Required checks detail, lab report, and technical diagnostics
    console.log('Taking screenshot 2: Checks, evidence & technical diagnostics...');
    const shot2 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACTS_DIR, 'screen24_02_checks_and_tech_details.png'), Buffer.from(shot2.result.data, 'base64'));

    // Open Result Entry modal for Moisture Content
    console.log('Opening Result Entry modal for Moisture...');
    await send('Runtime.evaluate', {
      expression: `
        const editBtn = document.querySelector('.qc-test-row .qc-entry-btn');
        if (editBtn) editBtn.click();
      `
    });
    await delay(800);

    // 3. Screenshot 3: Result Entry / Correction modal with rule feedback & reason requirement
    console.log('Taking screenshot 3: Result Entry / Correction modal...');
    const shot3 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACTS_DIR, 'screen24_03_result_entry_modal.png'), Buffer.from(shot3.result.data, 'base64'));

    // Close result entry modal
    await send('Runtime.evaluate', {
      expression: `
        const closeBtn = document.querySelector('.qc-submodal-card .qc-close-btn');
        if (closeBtn) closeBtn.click();
      `
    });
    await delay(600);

    // Open Review Quality modal
    console.log('Opening Review Quality modal...');
    await send('Runtime.evaluate', {
      expression: `
        const reviewBtn = document.querySelector('.qc-bottom-bar .btn-primary');
        if (reviewBtn) reviewBtn.click();
      `
    });
    await delay(800);

    // 4. Screenshot 4: Quality Review & Decision dialog
    console.log('Taking screenshot 4: Review & Decision modal...');
    const shot4 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACTS_DIR, 'screen24_04_review_decision_modal.png'), Buffer.from(shot4.result.data, 'base64'));

    // Click "Quality check passed"
    console.log('Clicking Quality check passed...');
    await send('Runtime.evaluate', {
      expression: `
        const passBtn = document.querySelector('.qc-review-card .btn-primary');
        if (passBtn) passBtn.click();
      `
    });
    await delay(800);

    // Scroll back to top to view passed banner and progression
    await send('Runtime.evaluate', {
      expression: `
        const el = document.querySelector('.qc-body-scroll');
        if (el) el.scrollTop = 0;
      `
    });
    await delay(600);

    // 5. Screenshot 5: Quality Check Passed state with banner & "Continue to packaging" action
    console.log('Taking screenshot 5: Quality Passed state...');
    const shot5 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACTS_DIR, 'screen24_05_quality_passed_state.png'), Buffer.from(shot5.result.data, 'base64'));

    // Open Demo drawer and switch to Scenario 3: Needs Attention
    console.log('Switching to Needs Attention scenario...');
    await send('Runtime.evaluate', {
      expression: `
        const demoBtn = document.querySelector('.qc-demo-btn');
        if (demoBtn) demoBtn.click();
      `
    });
    await delay(600);

    await send('Runtime.evaluate', {
      expression: `
        const btns = Array.from(document.querySelectorAll('.qc-submodal-card button'));
        const needsAttn = btns.find(b => b.textContent.includes('Scenario 3'));
        if (needsAttn) needsAttn.click();
      `
    });
    await delay(800);

    // 6. Screenshot 6: Needs Attention scenario with moisture out-of-range banner
    console.log('Taking screenshot 6: Needs Attention scenario...');
    const shot6 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACTS_DIR, 'screen24_06_needs_attention_scenario.png'), Buffer.from(shot6.result.data, 'base64'));

    console.log('All 6 Screen 24 verification screenshots captured successfully!');
    ws.close();
  } catch (err) {
    console.error('Verification error:', err);
  } finally {
    edge.kill();
    process.exit(0);
  }
}

run();
