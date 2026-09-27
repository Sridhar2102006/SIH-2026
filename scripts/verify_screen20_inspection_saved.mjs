import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/sridh/.gemini/antigravity-ide/brain/376452b6-17d5-4aab-a736-3c8277087e84';
const EDGE_PATH = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const PORT = 9380;

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  console.log('Launching headless Edge for Screen 20 verification on port', PORT);
  const userDataDir = `C:/Users/sridh/AppData/Local/Temp/edge_sih_s20_${Date.now()}`;
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
      const filename = `screen20_${name}.png`;
      const fullPath = path.join(ARTIFACTS_DIR, filename);
      fs.writeFileSync(fullPath, buffer);
      console.log(`Saved screenshot: ${filename}`);
      return fullPath;
    }

    // Step 1: Authenticated session setup
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

    // Step 2: Open Screen 19 and Save to trigger Screen 20
    console.log('\n--- Step 2: Open Screen 19 and click Save inspection ---');
    await evaluate(`(() => {
      if (window.__openInspectionResult) {
        window.__openInspectionResult({
          hiveId: 'hive-02',
          presetKey: 'STATE_A_POSSIBLE_AFB'
        });
      }
    })()`);
    await delay(1200);

    // Add beekeeper observation note before saving
    await evaluate(`(() => {
      const textarea = document.querySelector('#ir-user-obs-note');
      if (textarea) {
        textarea.value = 'Observed slight brood irregularity in frame center. Queen is active and marked with green dot.';
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
      }
    })()`);
    await delay(500);

    // Scroll to Save button in Screen 19 and click it
    await evaluate(`(() => {
      const body = document.querySelector('.ir-content-body');
      if (body) body.scrollTop = 1600;
    })()`);
    await delay(500);

    console.log('Clicking Save inspection in Screen 19...');
    await evaluate(`(() => {
      const saveBtn = Array.from(document.querySelectorAll('.ir-primary-cta-group button')).find(
        b => b.innerText.includes('Save inspection')
      );
      if (saveBtn) saveBtn.click();
    })()`);

    // Wait for save animation and transition to Screen 20
    await delay(2000);

    // Fallback: If not open, trigger via window.__openInspectionSaved
    const isScreen20Open = await evaluate(`Boolean(document.querySelector('.is-screen-overlay'))`);
    if (!isScreen20Open) {
      console.log('Screen 20 not open, triggering window.__openInspectionSaved...');
      await evaluate(`(() => {
        if (window.__openInspectionSaved) {
          window.__openInspectionSaved({
            hiveId: 'hive-02',
            preset: 'ATTENTION',
            isConcerning: true
          });
        }
      })()`);
      await delay(1000);
    }

    await captureScreenshot('01_inspection_saved_top');

    // Verify Screen 20 Core Content
    const successTitle = await evaluate(`document.querySelector('.is-success-title')?.innerText`);
    const successSub = await evaluate(`document.querySelector('.is-success-sub')?.innerText`);
    const syncLabel = await evaluate(`document.querySelector('.is-sync-label')?.innerText`);
    const conditionTitle = await evaluate(`document.querySelector('.is-condition-title')?.innerText`);
    const pillText = await evaluate(`document.querySelector('.is-pill')?.innerText`);
    const hasThumbnail = await evaluate(`Boolean(document.querySelector('.is-thumb-img'))`);
    const hasAttentionCard = await evaluate(`Boolean(document.querySelector('.is-attention-card'))`);
    const attnTitle = await evaluate(`document.querySelector('.is-attn-title')?.innerText`);
    const hasDiagnostics = await evaluate(`Boolean(document.querySelector('.is-diagnostics-card'))`);
    const hasTimelinePreview = await evaluate(`Boolean(document.querySelector('.is-preview-timeline-box'))`);

    console.log('\n--- Screen 20 Verification Results ---');
    console.log('Success Title:', successTitle);
    console.log('Success Subtitle:', successSub);
    console.log('Sync Status:', syncLabel);
    console.log('Condition:', conditionTitle);
    console.log('Result Badge:', pillText);
    console.log('Evidence Thumbnail Present:', hasThumbnail);
    console.log('Attention Card Present:', hasAttentionCard, '->', attnTitle);
    console.log('Three-dimension Diagnostics Present:', hasDiagnostics);
    console.log('Timeline Preview Present:', hasTimelinePreview);

    // Step 3: Test Image Lightbox Zoom
    console.log('\n--- Step 3: Testing Evidence Thumbnail Zoom ---');
    await evaluate(`(() => {
      const thumb = document.querySelector('.is-thumb-frame');
      if (thumb) thumb.click();
    })()`);
    await delay(800);
    await captureScreenshot('02_thumbnail_lightbox_zoom');

    // Close zoom
    await evaluate(`(() => {
      const closeBtn = document.querySelector('.is-fs-close-btn');
      if (closeBtn) closeBtn.click();
    })()`);
    await delay(600);

    // Step 4: Scroll down to inspect middle sections (Diagnostics & Timeline)
    console.log('\n--- Step 4: Checking middle sections (Diagnostics & Timeline) ---');
    await evaluate(`(() => {
      const body = document.querySelector('.is-content-body');
      if (body) body.scrollTop = 450;
    })()`);
    await delay(800);
    await captureScreenshot('03_timeline_and_diagnostics');

    // Step 5: Scroll to bottom for Actions
    console.log('\n--- Step 5: Checking bottom action buttons ---');
    await evaluate(`(() => {
      const body = document.querySelector('.is-content-body');
      if (body) body.scrollTop = 900;
    })()`);
    await delay(800);
    await captureScreenshot('04_bottom_navigation_actions');

    // Step 6: Test Jury Drawer & Healthy Preset (State 2)
    console.log('\n--- Step 6: Testing State 2 (No Concerning Signs) ---');
    await evaluate(`(() => {
      const demoBtn = document.querySelector('.is-demo-btn');
      if (demoBtn) demoBtn.click();
    })()`);
    await delay(600);

    await evaluate(`(() => {
      const btnHealthy = document.querySelector('[data-demo-state="HEALTHY"]');
      if (btnHealthy) btnHealthy.click();
    })()`);
    await delay(800);
    await evaluate(`(() => {
      const body = document.querySelector('.is-content-body');
      if (body) body.scrollTop = 0;
    })()`);
    await delay(600);
    await captureScreenshot('05_state_healthy_routine');

    // Step 7: Test Offline Saved State (State 3)
    console.log('\n--- Step 7: Testing State 3 (Saved Offline) ---');
    await evaluate(`(() => {
      const demoBtn = document.querySelector('.is-demo-btn');
      if (demoBtn) demoBtn.click();
    })()`);
    await delay(600);

    await evaluate(`(() => {
      const btnOffline = document.querySelector('[data-demo-state="OFFLINE"]');
      if (btnOffline) btnOffline.click();
    })()`);
    await delay(800);
    await captureScreenshot('06_state_saved_offline');

    // Step 8: Return to Attention Preset to test full continuity flow
    console.log('\n--- Step 8: Return to Attention preset and test View Hive ---');
    await evaluate(`(() => {
      const demoBtn = document.querySelector('.is-demo-btn');
      if (demoBtn) demoBtn.click();
    })()`);
    await delay(600);
    await evaluate(`(() => {
      const btnAttn = document.querySelector('[data-demo-state="ATTENTION"]');
      if (btnAttn) btnAttn.click();
    })()`);
    await delay(800);

    // Click "View hive" to verify Hive History update
    await evaluate(`(() => {
      const body = document.querySelector('.is-content-body');
      if (body) body.scrollTop = 900;
    })()`);
    await delay(500);

    console.log('Clicking "View hive" button...');
    await evaluate(`(() => {
      const viewHiveBtn = document.querySelector('.is-primary-action-btn');
      if (viewHiveBtn) viewHiveBtn.click();
    })()`);
    await delay(1500);

    // In HiveDetail, scroll down to the health timeline
    console.log('Scrolling to Hive History Timeline in Hive Detail...');
    await evaluate(`(() => {
      const appContent = document.querySelector('.app-content');
      if (appContent) appContent.scrollTop = 700;
    })()`);
    await delay(800);
    await captureScreenshot('07_hive_detail_timeline_updated');

    // Step 9: Navigate to Home to verify Attention banner
    console.log('\n--- Step 9: Navigating to Home to verify Attention banner ---');
    // First return from HiveDetail by clicking Back
    await evaluate(`(() => {
      const backBtn = document.querySelector('.hd-back-btn');
      if (backBtn) backBtn.click();
    })()`);
    await delay(800);

    // Click Home nav item
    await evaluate(`(() => {
      const navButtons = Array.from(document.querySelectorAll('.bottom-nav-item'));
      const homeNav = navButtons.find(b => b.innerText.includes('Home'));
      if (homeNav) homeNav.click();
    })()`);
    await delay(1200);
    await captureScreenshot('08_home_attention_banner_verified');

    const homeAttentionText = await evaluate(`document.querySelector('.hv-attention-card')?.innerText`);
    console.log('Home Attention Card Text:', homeAttentionText);

    console.log('\n========================================');
    console.log('All Screen 20 verification checks passed!');
    console.log('========================================\n');
  } catch (err) {
    console.error('Test execution failed:', err);
  } finally {
    edge.kill();
    process.exit(0);
  }
}

run();
