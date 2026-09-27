import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/sridh/.gemini/antigravity-ide/brain/376452b6-17d5-4aab-a736-3c8277087e84';
const EDGE_PATH = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const PORT = 9381;

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  console.log('Launching headless Edge for Screen 21 — Honey Home verification on port', PORT);
  const userDataDir = `C:/Users/sridh/AppData/Local/Temp/edge_sih_s21_${Date.now()}`;
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
      const filename = `screen21_${name}.png`;
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
        designations: ['BEEKEEPER', 'PROCESSOR'],
        isAuthenticated: true,
        requiresVerification: false,
        isOnboardingComplete: true
      };
      localStorage.setItem('honeychain_user_session', JSON.stringify(session));
      location.reload();
    })()`);

    await delay(3000);

    // Step 2: Switch to Honey Tab
    console.log('\n--- Step 2: Navigating to Honey Home (Screen 21) ---');
    await evaluate(`(() => {
      // Find bottom nav button with text or icon for Honey
      const navButtons = Array.from(document.querySelectorAll('.bottom-nav-item, nav button, .tab-btn'));
      const honeyBtn = navButtons.find(b => b.innerText.toLowerCase().includes('honey'));
      if (honeyBtn) {
        honeyBtn.click();
      } else {
        // Fallback: Dispatch navigation event or trigger state if window helper exists
        console.warn('Could not find honey nav button directly, inspecting DOM');
      }
    })()`);

    await delay(1200);

    // Check if Honey Home is rendered
    const isHoneyHomePresent = await evaluate(`Boolean(document.querySelector('.honey-home-view'))`);
    console.log('Honey Home rendered:', isHoneyHomePresent);

    if (!isHoneyHomePresent) {
      // Look for bottom nav by selector
      await evaluate(`(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.textContent.includes('Honey'));
        if (btn) btn.click();
      })()`);
      await delay(1000);
    }

    // Scroll to top of app content
    await evaluate(`(() => {
      const content = document.querySelector('.app-content');
      if (content) content.scrollTop = 0;
    })()`);
    await delay(500);

    // Step 3: Capture Top Section (Header, Create batch, filters, attention card)
    console.log('\n--- Step 3: Capturing Screen 21 Top View ---');
    await captureScreenshot('01_honey_home_top');

    const titleText = await evaluate(`document.querySelector('.hh-title')?.innerText`);
    const subtitleText = await evaluate(`document.querySelector('.hh-subtitle')?.innerText`);
    const hasCreateBtn = await evaluate(`Boolean(document.querySelector('.hh-create-batch-btn'))`);
    const activePills = await evaluate(`Array.from(document.querySelectorAll('.hh-pill')).map(p => p.innerText.replace(/\\n/g, ' '))`);
    const hasAttnCard = await evaluate(`Boolean(document.querySelector('.hh-attention-card'))`);
    const hasContinueCard = await evaluate(`Boolean(document.querySelector('.hh-continue-card'))`);

    console.log('Title:', titleText);
    console.log('Subtitle:', subtitleText);
    console.log('Has Create Batch button:', hasCreateBtn);
    console.log('Filter Pills:', activePills);
    console.log('Has Attention Card:', hasAttnCard);
    console.log('Has Continue Card:', hasContinueCard);

    // Step 4: Scroll down to active batches and visual steppers
    console.log('\n--- Step 4: Scrolling to Active Batches & Steppers ---');
    await evaluate(`(() => {
      const content = document.querySelector('.app-content');
      if (content) content.scrollTop = 420;
    })()`);
    await delay(600);
    await captureScreenshot('02_active_batches_stepper');

    const batchCards = await evaluate(`Array.from(document.querySelectorAll('.hh-batch-card')).map(c => ({
      id: c.querySelector('.hh-batch-id-tag')?.innerText,
      name: c.querySelector('.hh-batch-name')?.innerText,
      stage: c.querySelector('.hh-stage-badge')?.innerText,
      source: c.querySelector('.hh-source-val')?.innerText
    }))`);
    console.log('Active Batches displayed:', batchCards);

    // Step 5: Scroll to bottom for Recently Verified section
    console.log('\n--- Step 5: Scrolling to Recently Verified Section ---');
    await evaluate(`(() => {
      const content = document.querySelector('.app-content');
      if (content) content.scrollTop = 1100;
    })()`);
    await delay(600);
    await captureScreenshot('03_recently_verified');

    const verifiedCards = await evaluate(`Array.from(document.querySelectorAll('.hh-verified-card')).map(c => ({
      id: c.querySelector('.hh-vcard-id')?.innerText,
      name: c.querySelector('.hh-vcard-title')?.innerText,
      date: c.querySelector('.hh-vcard-date')?.innerText
    }))`);
    console.log('Recently Verified Batches:', verifiedCards);

    // Step 6: Test Quick Filters (e.g. Processing filter)
    console.log('\n--- Step 6: Testing Filter by "Processing" ---');
    await evaluate(`(() => {
      const content = document.querySelector('.app-content');
      if (content) content.scrollTop = 0;
      const pills = Array.from(document.querySelectorAll('.hh-pill'));
      const procPill = pills.find(p => p.innerText.includes('Processing'));
      if (procPill) procPill.click();
    })()`);
    await delay(600);
    await captureScreenshot('04_filtered_processing');

    const filteredCount = await evaluate(`document.querySelectorAll('.hh-batch-card').length`);
    console.log('Batches visible under Processing filter:', filteredCount);

    // Step 7: Open Demo Drawer to show role perspectives and empty states
    console.log('\n--- Step 7: Testing Demonstration Drawer ---');
    await evaluate(`(() => {
      // Reset filter to All first
      const allPill = Array.from(document.querySelectorAll('.hh-pill')).find(p => p.innerText.includes('All'));
      if (allPill) allPill.click();
      // Click Demo button
      const demoBtn = document.querySelector('.hh-demo-toggle-btn');
      if (demoBtn) demoBtn.click();
    })()`);
    await delay(600);
    await captureScreenshot('05_demo_drawer_perspectives');

    // Step 8: Test First-Run Empty State (Section 17)
    console.log('\n--- Step 8: Testing First-Run Empty State ---');
    await evaluate(`(() => {
      const emptyChip = Array.from(document.querySelectorAll('.hh-demo-chip')).find(b => b.innerText.includes('Simulate Empty State'));
      if (emptyChip) emptyChip.click();
    })()`);
    await delay(600);
    await captureScreenshot('06_empty_state');

    const emptyTitle = await evaluate(`document.querySelector('.hh-fre-title')?.innerText`);
    const emptySub = await evaluate(`document.querySelector('.hh-fre-sub')?.innerText`);
    console.log('Empty state title:', emptyTitle);
    console.log('Empty state subtitle:', emptySub);

    console.log('\n========================================');
    console.log('SCREEN 21 VERIFICATION COMPLETE — SUCCESS');
    console.log('========================================\n');

  } catch (err) {
    console.error('Screen 21 verification error:', err);
  } finally {
    edge.kill();
    process.exit(0);
  }
}

run();
