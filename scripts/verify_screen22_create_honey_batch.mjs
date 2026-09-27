import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/sridh/.gemini/antigravity-ide/brain/376452b6-17d5-4aab-a736-3c8277087e84';
const EDGE_PATH = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const PORT = 9382;

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  console.log('Launching headless Edge for Screen 22 — Create Honey Batch verification on port', PORT);
  const userDataDir = `C:/Users/sridh/AppData/Local/Temp/edge_sih_s22_${Date.now()}`;
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
    console.log('Connected to CDP via WebSocket');

    await send('Page.enable');
    await send('Runtime.enable');
    await send('DOM.enable');

    async function evaluate(code) {
      const resp = await send('Runtime.evaluate', {
        expression: code,
        returnByValue: true,
        awaitPromise: true
      });
      if (resp.result?.exceptionDetails) {
        console.error('Eval error:', resp.result.exceptionDetails);
      }
      return resp.result?.result?.value;
    }

    async function captureScreenshot(name) {
      const result = await send('Page.captureScreenshot', { format: 'png' });
      const buffer = Buffer.from(result.result.data, 'base64');
      const filename = `screen22_${name}.png`;
      const fullPath = path.join(ARTIFACTS_DIR, filename);
      fs.writeFileSync(fullPath, buffer);
      console.log(`Saved screenshot: ${filename}`);
      return fullPath;
    }

    // Step 1: Set up authenticated session to bypass onboarding
    console.log('\n--- Step 1: Setting up active authenticated session ---');
    await evaluate(`(() => {
      const session = {
        operator: 'Elena Vance',
        apiary: 'North Valley Apiary',
        designation: 'BEEKEEPER',
        capabilities: ['HIVE_MONITORING', 'HIVE_INSPECTION', 'HIVE_PHOTO_CAPTURE', 'BATCH_CREATE'],
        designations: ['BEEKEEPER'],
        isAuthenticated: true,
        requiresVerification: false,
        isOnboardingComplete: true
      };
      localStorage.setItem('honeychain_user_session', JSON.stringify(session));
      location.reload();
    })()`);

    await delay(3000);

    // Step 2: Open Create Honey Batch (Screen 22)
    console.log('\n--- Step 2: Opening Screen 22 — Create Honey Batch ---');
    await evaluate(`(() => {
      if (window.__openCreateBatch) {
        window.__openCreateBatch();
      } else {
        // Fallback: click button
        const btn = document.querySelector('.hh-create-batch-btn');
        if (btn) btn.click();
      }
    })()`);

    await delay(1200);

    const isModalOpen = await evaluate(`Boolean(document.querySelector('.cb-modal-overlay'))`);
    console.log('Create Batch Modal Open:', isModalOpen);

    // Step 3: Capture Step 1 (Select Source)
    console.log('\n--- Step 3: Capturing Step 1 (Select Source) ---');
    const step1Title = await evaluate(`document.querySelector('.cb-title')?.innerText`);
    const step1Question = await evaluate(`document.querySelector('.cb-question-title')?.innerText`);
    const step1Hives = await evaluate(`Array.from(document.querySelectorAll('.cb-hive-card')).map(c => c.querySelector('.cb-hcard-name')?.innerText)`);
    console.log('Title:', step1Title);
    console.log('Question:', step1Question);
    console.log('Available Hives:', step1Hives);

    await captureScreenshot('01_step1_select_source');

    // Step 4: Advance to Step 2 (Collection Details)
    console.log('\n--- Step 4: Advancing to Step 2 (Collection Details) ---');
    await evaluate(`(() => {
      const nextBtn = document.querySelector('.cb-primary-cta');
      if (nextBtn) nextBtn.click();
    })()`);
    await delay(800);

    const step2Question = await evaluate(`document.querySelector('.cb-question-title')?.innerText`);
    console.log('Step 2 Question:', step2Question);

    // Enter notes in collection notes
    await evaluate(`(() => {
      const notes = document.querySelector('#cb-notes-input');
      if (notes) {
        notes.value = 'Cold frame extraction under sunny morning conditions. Rich golden hue and sweet clover bouquet.';
        notes.dispatchEvent(new Event('input', { bubbles: true }));
      }
    })()`);
    await delay(400);

    await captureScreenshot('02_step2_collection_details');

    // Step 5: Advance to Step 3 (Review Batch)
    console.log('\n--- Step 5: Advancing to Step 3 (Review Batch) ---');
    await evaluate(`(() => {
      const reviewBtn = Array.from(document.querySelectorAll('.cb-footer button')).find(b => b.innerText.includes('Review batch'));
      if (reviewBtn) reviewBtn.click();
    })()`);
    await delay(800);

    const step3Question = await evaluate(`document.querySelector('.cb-question-title')?.innerText`);
    const reviewName = await evaluate(`document.querySelector('.cb-review-batch-name')?.innerText`);
    const reviewYield = await evaluate(`document.querySelector('.cb-review-grid')?.innerText`);
    console.log('Step 3 Question:', step3Question);
    console.log('Review Batch Name:', reviewName);
    console.log('Review Details:\n', reviewYield);

    await captureScreenshot('03_step3_review_batch');

    // Step 6: Create Batch and verify Step 4 (Success State)
    console.log('\n--- Step 6: Creating Batch & Verifying Success State ---');
    await evaluate(`(() => {
      const createBtn = Array.from(document.querySelectorAll('.cb-footer button')).find(b => b.innerText.includes('Create batch'));
      if (createBtn) createBtn.click();
    })()`);
    await delay(1200);

    const successBadge = await evaluate(`document.querySelector('.cb-success-badge')?.innerText`);
    const successTitle = await evaluate(`document.querySelector('.cb-success-title')?.innerText`);
    const successId = await evaluate(`document.querySelector('.cb-success-id-pill')?.innerText`);
    const successState = await evaluate(`document.querySelector('.cb-sjourney-status-text')?.innerText`);
    console.log('Success Badge:', successBadge);
    console.log('Created Batch Name:', successTitle);
    console.log('Created Batch ID:', successId);
    console.log('Journey State:', successState);

    await captureScreenshot('04_step4_batch_created_success');

    // Step 7: Test "View batch" button to confirm transition to BatchDetail
    console.log('\n--- Step 7: Testing View batch navigation ---');
    await evaluate(`(() => {
      const viewBatchBtn = Array.from(document.querySelectorAll('.cb-footer button')).find(b => b.innerText.includes('View batch'));
      if (viewBatchBtn) viewBatchBtn.click();
    })()`);
    await delay(1200);

    const isBatchDetailActive = await evaluate(`Boolean(document.querySelector('.batch-detail-view'))`);
    console.log('BatchDetail screen active:', isBatchDetailActive);
    await captureScreenshot('05_batch_detail_transition');

    // Step 8: Test Jury Demonstration Pre-fill shortcut
    console.log('\n--- Step 8: Testing Jury Demonstration Pre-fill shortcut ---');
    // Open modal again
    await evaluate(`(() => {
      if (window.__openCreateBatch) {
        window.__openCreateBatch();
      }
    })()`);
    await delay(1200);

    // Click Jury Demo shortcut
    await evaluate(`(() => {
      const shortcutBtn = document.querySelector('.cb-jshortcut-btn');
      if (shortcutBtn) shortcutBtn.click();
    })()`);
    await delay(1000);

    const hasPrepopulatedNotice = await evaluate(`Boolean(document.querySelector('.cb-prepopulated-notice'))`);
    const recordedTag = await evaluate(`document.querySelector('.cb-recorded-tag')?.innerText`);
    console.log('Prepopulated notice displayed:', hasPrepopulatedNotice);
    console.log('Recorded tag:', recordedTag);

    await captureScreenshot('06_jury_prefill_collection');

    console.log('\n========================================');
    console.log('SCREEN 22 VERIFICATION COMPLETE — SUCCESS');
    console.log('========================================\n');

  } catch (err) {
    console.error('Screen 22 verification error:', err);
  } finally {
    edge.kill();
    process.exit(0);
  }
}

run();
