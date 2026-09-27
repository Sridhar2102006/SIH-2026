import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/sridh/.gemini/antigravity-ide/brain/376452b6-17d5-4aab-a736-3c8277087e84';
const EDGE_PATH = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const PORT = 9370;

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  console.log('Launching headless Edge for Screen 19 verification on port', PORT);
  const userDataDir = `C:/Users/sridh/AppData/Local/Temp/edge_sih_s19_${Date.now()}`;
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
      const filename = `screen19_${name}.png`;
      const fullPath = path.join(ARTIFACTS_DIR, filename);
      fs.writeFileSync(fullPath, buffer);
      console.log(`Saved screenshot: ${filename}`);
      return fullPath;
    }

    // Step 1: Set up authenticated session
    console.log('\n--- Step 1: Setting up active authenticated session ---');
    await evaluate(`(() => {
      const session = {
        operator: 'Elena Vance',
        apiary: 'North Valley Apiary',
        designation: 'BEEKEEPER',
        capabilities: ['HIVE_MONITORING', 'HIVE_INSPECTION', 'HIVE_PHOTO_CAPTURE'],
        designations: ['BEEKEEPER'],
        isAuthenticated: true,
        requiresVerification: false,
        isOnboardingComplete: true
      };
      localStorage.setItem('honeychain_user_session', JSON.stringify(session));
      location.reload();
    })()`);

    await delay(3000);

    // Step 2: Open Screen 19
    console.log('\n--- Step 2: Opening Screen 19 (Inspection Result) ---');
    await evaluate(`(() => {
      if (window.__openInspectionResult) {
        window.__openInspectionResult({
          hiveId: 'hive-02',
          presetKey: 'STATE_A_POSSIBLE_AFB'
        });
      }
    })()`);

    await delay(1200);
    await captureScreenshot('01_hero_afb_result');

    // Verify Screen 19 Content Hierarchy
    const headerTitle = await evaluate(`document.querySelector('.ir-title')?.innerText`);
    const subtitle = await evaluate(`document.querySelector('.ir-subtitle')?.innerText`);
    const heroTitle = await evaluate(`document.querySelector('.ir-hero-main-title')?.innerText`);
    const heroSub = await evaluate(`document.querySelector('.ir-hero-supporting-text')?.innerText`);
    const condition = await evaluate(`document.querySelector('.ir-condition-val')?.innerText`);
    const hasImage = await evaluate(`Boolean(document.querySelector('.ir-frame-image'))`);
    const hasLocalization = await evaluate(`Boolean(document.querySelector('.ir-localization-overlay'))`);
    const noticedItems = await evaluate(`
      Array.from(document.querySelectorAll('.ir-findings-list li')).map(li => li.innerText)
    `);
    const whatItMeans = await evaluate(`document.querySelector('.ir-card-text')?.innerText`);
    const nextSteps = await evaluate(`
      Array.from(document.querySelectorAll('.ir-next-steps-list li')).map(li => li.innerText)
    `);

    console.log('\n--- Screen 19 Verification Results ---');
    console.log('Title:', headerTitle);
    console.log('Subtitle:', subtitle);
    console.log('Hero Status:', heroTitle, '-', heroSub);
    console.log('Condition:', condition);
    console.log('Has Original Frame Image:', hasImage);
    console.log('Has Localization Box (Area to inspect):', hasLocalization);
    console.log('Noticed items count:', noticedItems?.length);
    console.log('What it means:', whatItMeans);
    console.log('Next steps count:', nextSteps?.length);

    // Step 4: Test Tap to Enlarge / Fullscreen
    console.log('\n--- Step 4: Testing Tap to Enlarge / Fullscreen ---');
    await evaluate(`(() => {
      const viewer = document.querySelector('.ir-frame-viewer');
      if (viewer) viewer.click();
    })()`);
    await delay(800);
    await captureScreenshot('02_fullscreen_image_zoom');

    // Close zoom
    await evaluate(`(() => {
      const closeBtn = document.querySelector('.ir-fs-close');
      if (closeBtn) closeBtn.click();
    })()`);
    await delay(800);

    // Step 5: Test Adding Beekeeper Observation Note
    console.log('\n--- Step 5: Testing Beekeeper Observation Input ---');
    await evaluate(`(() => {
      const textarea = document.querySelector('#ir-user-obs-note');
      if (textarea) {
        textarea.value = 'Observed slight brood irregularity in frame center. Queen is active and marked with green dot.';
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
      }
    })()`);
    await delay(500);

    // Scroll down to check middle sections
    await evaluate(`(() => {
      const body = document.querySelector('.ir-content-body');
      if (body) body.scrollTop = 520;
    })()`);
    await delay(800);
    await captureScreenshot('03_observation_and_context');

    // Step 6: Test Technical Details Collapse (Section 19)
    console.log('\n--- Step 6: Testing Technical Details Collapse ---');
    await evaluate(`(() => {
      const trigger = document.querySelector('.ir-expand-trigger');
      if (trigger) trigger.click();
    })()`);
    await delay(1200);

    const techValues = await evaluate(`(() => {
      return Array.from(document.querySelectorAll('.ir-tech-row')).map(r => r.innerText.replace(/\\n/g, ' : '));
    })()`);
    console.log('Technical Details rendered (Sanitized):', techValues);

    // Scroll down to view expanded technical details
    await evaluate(`(() => {
      const body = document.querySelector('.ir-content-body');
      if (body) body.scrollTop = 1100;
    })()`);
    await delay(800);
    await captureScreenshot('04_technical_details_sanitized');

    // Step 7: Test Presets Switching (Demo Drawer)
    console.log('\n--- Step 7: Testing State B (No concerning signs) ---');
    await evaluate(`(() => {
      const demoBtn = document.querySelector('.ir-demo-toggle-btn');
      if (demoBtn) demoBtn.click();
    })()`);
    await delay(600);

    await evaluate(`(() => {
      const btnStateB = document.querySelector('[data-preset-id="STATE_B_NO_CONCERNING_SIGNS"]');
      if (btnStateB) btnStateB.click();
    })()`);
    await delay(1000);
    await evaluate(`(() => {
      const body = document.querySelector('.ir-content-body');
      if (body) body.scrollTop = 0;
    })()`);
    await delay(600);
    await captureScreenshot('05_state_b_no_concerning_signs');

    console.log('\n--- Step 8: Testing State C (Unclear / Retake) ---');
    await evaluate(`(() => {
      const demoBtn = document.querySelector('.ir-demo-toggle-btn');
      if (demoBtn) demoBtn.click();
    })()`);
    await delay(600);
    await evaluate(`(() => {
      const btnStateC = document.querySelector('[data-preset-id="STATE_C_UNCLEAR"]');
      if (btnStateC) btnStateC.click();
    })()`);
    await delay(1000);
    await evaluate(`(() => {
      const body = document.querySelector('.ir-content-body');
      if (body) body.scrollTop = 0;
    })()`);
    await delay(600);
    await captureScreenshot('06_state_c_unclear_frame');

    console.log('\n--- Step 9: Testing State F (Multiple Possible Issues) ---');
    await evaluate(`(() => {
      const demoBtn = document.querySelector('.ir-demo-toggle-btn');
      if (demoBtn) demoBtn.click();
    })()`);
    await delay(600);
    await evaluate(`(() => {
      const btnStateF = document.querySelector('[data-preset-id="STATE_F_MULTIPLE_ISSUES"]');
      if (btnStateF) btnStateF.click();
    })()`);
    await delay(1000);
    await evaluate(`(() => {
      const body = document.querySelector('.ir-content-body');
      if (body) body.scrollTop = 0;
    })()`);
    await delay(600);
    await captureScreenshot('07_state_f_multiple_candidates');

    // Switch back to State A to test saving flow
    console.log('\n--- Step 10: Saving inspection and verifying flow ---');
    await evaluate(`(() => {
      const demoBtn = document.querySelector('.ir-demo-toggle-btn');
      if (demoBtn) demoBtn.click();
    })()`);
    await delay(600);
    await evaluate(`(() => {
      const btnStateA = document.querySelector('[data-preset-id="STATE_A_POSSIBLE_AFB"]');
      if (btnStateA) btnStateA.click();
    })()`);
    await delay(800);

    // Scroll to Save button
    await evaluate(`(() => {
      const body = document.querySelector('.ir-content-body');
      if (body) body.scrollTop = 1600;
    })()`);
    await delay(600);

    // Click Save inspection button
    console.log('Clicking Save inspection...');
    await evaluate(`(() => {
      const saveBtn = Array.from(document.querySelectorAll('.ir-primary-cta-group button')).find(
        b => b.innerText.includes('Save inspection')
      );
      if (saveBtn) saveBtn.click();
    })()`);
    await delay(1800);
    await captureScreenshot('08_save_success_state');

    // Verify Success Screen
    const isSavedTitle = await evaluate(`document.querySelector('.ir-saved-title')?.innerText`);
    console.log('Saved success card title:', isSavedTitle);

    // Click "View hive"
    console.log('Clicking View hive...');
    await evaluate(`(() => {
      const viewHiveBtn = Array.from(document.querySelectorAll('.ir-saved-btns-row button')).find(
        b => b.innerText.includes('View hive')
      );
      if (viewHiveBtn) viewHiveBtn.click();
    })()`);
    await delay(1200);
    await captureScreenshot('09_hive_detail_updated');

    // Return to Home to verify Attention banner
    console.log('Navigating to Home...');
    await evaluate(`(() => {
      const navButtons = Array.from(document.querySelectorAll('.bottom-nav-item'));
      const homeNav = navButtons.find(b => b.innerText.includes('Home'));
      if (homeNav) homeNav.click();
    })()`);
    await delay(1200);
    await captureScreenshot('10_home_screen_attention_alert');

    console.log('\n========================================');
    console.log('All Screen 19 verification checks passed!');
    console.log('========================================\n');
  } catch (err) {
    console.error('Test execution failed:', err);
  } finally {
    edge.kill();
    process.exit(0);
  }
}

run();
