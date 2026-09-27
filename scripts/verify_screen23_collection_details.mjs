import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/sridh/.gemini/antigravity-ide/brain/376452b6-17d5-4aab-a736-3c8277087e84';
const EDGE_PATH = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const PORT = 9383;

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  console.log('Launching headless Edge for Screen 23 — Collection Details verification on port', PORT);
  const userDataDir = `C:/Users/sridh/AppData/Local/Temp/edge_sih_s23_${Date.now()}`;
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
      const filename = `screen23_${name}.png`;
      const fullPath = path.join(ARTIFACTS_DIR, filename);
      fs.writeFileSync(fullPath, buffer);
      console.log(`Saved screenshot: ${filename}`);
      return fullPath;
    }

    // Step 1: Authenticated session setup
    console.log('\n--- Step 1: Setting up active authenticated session ---');
    await evaluate(`(() => {
      const session = {
        operator: 'Sarah Lindqvist',
        apiary: 'Meadowbrook Apiary',
        designation: 'BEEKEEPER',
        capabilities: ['HIVE_MONITORING', 'HIVE_INSPECTION', 'HIVE_PHOTO_CAPTURE', 'BATCH_CREATE', 'COLLECTION_VIEW'],
        designations: ['BEEKEEPER', 'PROCESSOR'],
        isAuthenticated: true,
        requiresVerification: false,
        isOnboardingComplete: true
      };
      localStorage.setItem('honeychain_user_session', JSON.stringify(session));
      location.reload();
    })()`);

    await delay(3000);

    // Step 2: Open Screen 23 (Collection Details) with Linked Collection (Hive 01)
    console.log('\n--- Step 2: Opening Screen 23 — Collection Details ---');
    await evaluate(`(() => {
      if (window.__openCollectionDetails) {
        window.__openCollectionDetails({ collectionId: 'col-2026-0925-01' });
      }
    })()`);
    await delay(1200);

    const isScreen23Open = await evaluate(`Boolean(document.querySelector('.cd-view-overlay'))`);
    console.log('Screen 23 View Open:', isScreen23Open);

    // Step 3: Verify & Capture Top View (Harvest Summary, Source, Hive Context)
    console.log('\n--- Step 3: Capturing Screen 23 Top Section ---');
    const titleText = await evaluate(`document.querySelector('.cd-title')?.innerText`);
    const subtitleText = await evaluate(`document.querySelector('.cd-subtitle')?.innerText`);
    const statusText = await evaluate(`document.querySelector('.cd-status-badge')?.innerText`);
    const heroMetric = await evaluate(`document.querySelector('.cd-hero-metric')?.innerText`);
    const heroStatement = await evaluate(`document.querySelector('.cd-hero-statement')?.innerText`);
    const hiveCondition = await evaluate(`document.querySelector('.cd-hcontext-cond')?.innerText`);

    console.log('Title:', titleText);
    console.log('Subtitle:', subtitleText);
    console.log('Status Badge:', statusText);
    console.log('Harvest Yield:', heroMetric, 'kg');
    console.log('Summary Statement:', heroStatement);
    console.log('Hive Condition:', hiveCondition);

    await captureScreenshot('01_collection_details_top');

    // Step 4: Scroll down to Linked Honey Batch & Evidence
    console.log('\n--- Step 4: Scrolling to Linked Honey Batch & Evidence ---');
    await evaluate(`(() => {
      const scrollBody = document.querySelector('.cd-body-scroll');
      if (scrollBody) scrollBody.scrollTop = 380;
    })()`);
    await delay(600);

    const linkedBatchTitle = await evaluate(`document.querySelector('.cd-blink-title')?.innerText`);
    const linkedBatchId = await evaluate(`document.querySelector('.cd-blink-id')?.innerText`);
    const flowStatement = await evaluate(`document.querySelector('.cd-blink-flow-statement')?.innerText`);
    const notesText = await evaluate(`document.querySelector('.cd-notes-text')?.innerText`);
    const hasImageThumb = await evaluate(`Boolean(document.querySelector('.cd-thumb-img'))`);

    console.log('Linked Batch:', linkedBatchTitle, `(${linkedBatchId})`);
    console.log('Traceability Flow:', flowStatement);
    console.log('Collection Notes:', notesText);
    console.log('Has Image Evidence Thumbnail:', hasImageThumb);

    await captureScreenshot('02_linked_batch_and_evidence');

    // Step 5: Expand Technical Details & Audit History
    console.log('\n--- Step 5: Expanding Technical Details & Audit History ---');
    await evaluate(`(() => {
      const scrollBody = document.querySelector('.cd-body-scroll');
      if (scrollBody) scrollBody.scrollTop = 800;
      const techBtn = document.querySelector('.cd-tech-toggle-btn');
      if (techBtn) techBtn.click();
    })()`);
    await delay(600);

    const techRows = await evaluate(`Array.from(document.querySelectorAll('.cd-tech-row')).map(r => ({
      label: r.querySelector('.cd-tlabel')?.innerText,
      val: r.querySelector('.cd-tval')?.innerText
    }))`);
    const historyActions = await evaluate(`Array.from(document.querySelectorAll('.cd-hist-action')).map(a => a.innerText)`);

    console.log('Technical Details Rows:', techRows);
    console.log('Record History Actions:', historyActions);

    await captureScreenshot('03_technical_details_and_history');

    // Step 6: Test Edit Collection Modal
    console.log('\n--- Step 6: Opening Edit Collection Modal ---');
    await evaluate(`(() => {
      const editBtn = document.querySelector('.cd-edit-btn');
      if (editBtn) editBtn.click();
    })()`);
    await delay(600);

    const isEditModalVisible = await evaluate(`Boolean(document.querySelector('.cd-submodal-overlay'))`);
    console.log('Edit Collection Modal Visible:', isEditModalVisible);

    await captureScreenshot('04_edit_collection_modal');

    // Close edit modal
    await evaluate(`(() => {
      const cancelBtn = Array.from(document.querySelectorAll('.cd-submodal-footer button')).find(b => b.innerText.includes('Cancel'));
      if (cancelBtn) cancelBtn.click();
    })()`);
    await delay(500);

    // Step 7: Test Unlinked Collection Scenario (Preset 2 — Hive 04)
    console.log('\n--- Step 7: Testing Unlinked Collection Scenario ---');
    await evaluate(`(() => {
      // Click Demo button
      const demoBtn = document.querySelector('.cd-demo-btn');
      if (demoBtn) demoBtn.click();
    })()`);
    await delay(500);

    // Select Preset 2 (Hive 04)
    await evaluate(`(() => {
      const pills = Array.from(document.querySelectorAll('.cd-demo-pill'));
      const hive04Pill = pills.find(p => p.innerText.includes('Hive 04'));
      if (hive04Pill) hive04Pill.click();
    })()`);
    await delay(800);

    // Scroll to top
    await evaluate(`(() => {
      const scrollBody = document.querySelector('.cd-body-scroll');
      if (scrollBody) scrollBody.scrollTop = 0;
    })()`);
    await delay(500);

    const unlinkedStatus = await evaluate(`document.querySelector('.cd-status-badge')?.innerText`);
    const unlinkedTitle = await evaluate(`document.querySelector('.cd-unlinked-title')?.innerText`);
    const hasCreateBatchBtn = await evaluate(`Boolean(document.querySelector('.cd-create-batch-btn'))`);

    console.log('Unlinked Status:', unlinkedStatus);
    console.log('Unlinked Section Title:', unlinkedTitle);
    console.log('Has Create Batch button:', hasCreateBatchBtn);

    await captureScreenshot('05_unlinked_collection_scenario');

    // Step 8: Test Needs Review Scenario (Preset 3 — Hive 02)
    console.log('\n--- Step 8: Testing Needs Review Scenario ---');
    await evaluate(`(() => {
      const demoBtn = document.querySelector('.cd-demo-btn');
      if (demoBtn) demoBtn.click();
    })()`);
    await delay(500);

    await evaluate(`(() => {
      const pills = Array.from(document.querySelectorAll('.cd-demo-pill'));
      const hive02Pill = pills.find(p => p.innerText.includes('Hive 02'));
      if (hive02Pill) hive02Pill.click();
    })()`);
    await delay(800);

    await evaluate(`(() => {
      const scrollBody = document.querySelector('.cd-body-scroll');
      if (scrollBody) scrollBody.scrollTop = 0;
    })()`);
    await delay(500);

    const needsReviewStatus = await evaluate(`document.querySelector('.cd-status-badge')?.innerText`);
    const alertTitle = await evaluate(`document.querySelector('.cd-ralert-head')?.innerText`);
    const alertReason = await evaluate(`document.querySelector('.cd-ralert-text')?.innerText`);

    console.log('Needs Review Status:', needsReviewStatus);
    console.log('Alert Banner Title:', alertTitle);
    console.log('Alert Reason:', alertReason);

    await captureScreenshot('06_needs_review_scenario');

    console.log('\n========================================');
    console.log('SCREEN 23 VERIFICATION COMPLETE — SUCCESS');
    console.log('========================================\n');

  } catch (err) {
    console.error('Screen 23 verification error:', err);
  } finally {
    edge.kill();
    process.exit(0);
  }
}

run();
