import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/sridh/.gemini/antigravity-ide/brain/376452b6-17d5-4aab-a736-3c8277087e84';
const EDGE_PATH = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const PORT = 9387;

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  console.log('Launching headless Edge for Screen 25 — Honey Journey verification on port', PORT);
  const userDataDir = `C:/Users/sridh/AppData/Local/Temp/edge_sih_s25_${Date.now()}`;
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
            designations: ['BEEKEEPER', 'PROCESSOR', 'QUALITY'],
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

    // Open Screen 25 — Honey Journey for Batch HC-2409
    console.log('Opening Screen 25 — Honey Journey for Batch HC-2409...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          if (window.__openBatchJourney) {
            window.__openBatchJourney({ batchId: 'batch-hc-2409' });
          }
        })()
      `
    });
    await delay(1200);

    const isJourneyOpen = await send('Runtime.evaluate', {
      expression: `Boolean(document.querySelector('.bj-view-overlay'))`,
      returnByValue: true
    });
    console.log('Batch Journey Overlay Open:', isJourneyOpen.result?.result?.value);

    // 1. Screenshot 1: Overview top with Header, Status, and Stepper Stages 1-3
    console.log('Taking screenshot 1: Top overview & vertical journey stepper...');
    const shot1 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACTS_DIR, 'screen25_01_honey_journey_overview.png'), Buffer.from(shot1.result.data, 'base64'));

    // Scroll down to view expanded Quality stage, Packaging, and Verified stages
    await send('Runtime.evaluate', {
      expression: `
        const el = document.querySelector('.bj-body-scroll');
        if (el) el.scrollTop = 280;
      `
    });
    await delay(600);

    // 2. Screenshot 2: Quality stage details, Packaging & Verified stages
    console.log('Taking screenshot 2: Quality, Packaging & Verified stages...');
    const shot2 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACTS_DIR, 'screen25_02_stages_details.png'), Buffer.from(shot2.result.data, 'base64'));

    // Scroll further down to Activity History and expand Technical Proof accordion
    await send('Runtime.evaluate', {
      expression: `
        const el = document.querySelector('.bj-body-scroll');
        if (el) el.scrollTop = 600;
        const btn = document.querySelector('.bj-tech-toggle-btn');
        if (btn) btn.click();
      `
    });
    await delay(600);

    // 3. Screenshot 3: Activity timeline and Technical proof details
    console.log('Taking screenshot 3: Activity history & technical proof...');
    const shot3 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACTS_DIR, 'screen25_03_activity_and_technical_proof.png'), Buffer.from(shot3.result.data, 'base64'));

    // Open Jury Demo Drawer
    console.log('Opening Jury Demo Drawer...');
    await send('Runtime.evaluate', {
      expression: `
        const demoBtn = document.querySelector('.bj-demo-btn');
        if (demoBtn) demoBtn.click();
      `
    });
    await delay(800);

    // 4. Screenshot 4: Jury Demo Drawer
    console.log('Taking screenshot 4: Jury Demo Drawer...');
    const shot4 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACTS_DIR, 'screen25_04_jury_demo_drawer.png'), Buffer.from(shot4.result.data, 'base64'));

    // Switch to Scenario 4: Fully Certified & Consumer QR
    console.log('Switching to Scenario 4 (Verified & Consumer QR)...');
    await send('Runtime.evaluate', {
      expression: `
        const btns = Array.from(document.querySelectorAll('.bj-submodal-card button'));
        const verifiedBtn = btns.find(b => b.textContent.includes('Scenario 4'));
        if (verifiedBtn) verifiedBtn.click();
      `
    });
    await delay(800);

    await send('Runtime.evaluate', {
      expression: `
        const el = document.querySelector('.bj-body-scroll');
        if (el) el.scrollTop = 0;
      `
    });
    await delay(600);

    // 5. Screenshot 5: Fully Certified & Origin Verified State
    console.log('Taking screenshot 5: Certified & Origin Verified state...');
    const shot5 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACTS_DIR, 'screen25_05_verified_consumer_state.png'), Buffer.from(shot5.result.data, 'base64'));

    // Open Demo drawer again and switch to Scenario 3: Active Processing
    console.log('Switching to Scenario 3 (Active Processing)...');
    await send('Runtime.evaluate', {
      expression: `
        const demoBtn = document.querySelector('.bj-demo-btn');
        if (demoBtn) demoBtn.click();
      `
    });
    await delay(600);

    await send('Runtime.evaluate', {
      expression: `
        const btns = Array.from(document.querySelectorAll('.bj-submodal-card button'));
        const procBtn = btns.find(b => b.textContent.includes('Scenario 3'));
        if (procBtn) procBtn.click();
      `
    });
    await delay(800);

    // 6. Screenshot 6: Active Processing state
    console.log('Taking screenshot 6: Active Processing state...');
    const shot6 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACTS_DIR, 'screen25_06_active_processing_scenario.png'), Buffer.from(shot6.result.data, 'base64'));

    console.log('All 6 Screen 25 verification screenshots captured successfully!');
    ws.close();
  } catch (err) {
    console.error('Verification error:', err);
  } finally {
    edge.kill();
    process.exit(0);
  }
}

run();
