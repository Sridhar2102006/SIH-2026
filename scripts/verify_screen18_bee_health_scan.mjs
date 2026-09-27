import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/sridh/.gemini/antigravity-ide/brain/376452b6-17d5-4aab-a736-3c8277087e84';
const EDGE_PATH = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const PORT = 9350;

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  console.log('Launching headless Edge for Screen 18 verification on port', PORT);
  const userDataDir = `C:/Users/sridh/AppData/Local/Temp/edge_sih_s18_${Date.now()}`;
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
        returnByValue: true
      });
      return resp?.result?.result?.value;
    }

    async function takeScreenshot(name) {
      const resp = await send('Page.captureScreenshot', { format: 'png' });
      if (resp?.result?.data) {
        const buffer = Buffer.from(resp.result.data, 'base64');
        const filePath = path.join(ARTIFACTS_DIR, `${name}.png`);
        fs.writeFileSync(filePath, buffer);
        console.log(`Saved screenshot: ${name}.png (${buffer.length} bytes)`);
        return filePath;
      }
      return null;
    }

    console.log('Setting authenticated beekeeper session with HEALTH_SCAN capabilities...');
    await evaluate(`
      (() => {
        const session = {
          isAuthenticated: true,
          isOnboardingComplete: true,
          operator: 'Sarah Lindqvist',
          apiaryId: 'apiary-mb-01',
          role: 'Master Apiarist',
          designations: ['BEEKEEPER', 'FACILITY_MANAGER'],
          capabilities: [
            'HIVE_MONITORING',
            'HIVE_INSPECTION',
            'HIVE_IMAGE_CAPTURE',
            'SENSOR_MONITORING',
            'HONEY_COLLECTION'
          ],
          workContexts: {
            areas: ['Apiary / farm', 'Processing facility'],
            handles: ['Hive operations', 'Honey batches']
          }
        };
        localStorage.setItem('honeychain_user_session', JSON.stringify(session));
        window.location.reload();
      })()
    `);

    await delay(3500);

    console.log('Waiting for splash to finish and app to load...');
    for (let i = 0; i < 25; i++) {
      const ready = await evaluate(`!!document.querySelector('.bottom-nav .nav-item')`);
      if (ready) {
        console.log('App is ready on main layout.');
        break;
      }
      await delay(400);
    }
    await delay(600);

    // 1. Navigate to Hives Tab
    console.log('Clicking Hives tab...');
    const clickedNav = await evaluate(`
      (() => {
        const nav = Array.from(document.querySelectorAll('.bottom-nav .nav-item')).find(n => n.innerText.includes('Hives'));
        if (nav) {
          nav.click();
          return true;
        }
        return false;
      })()
    `);
    console.log('Hives tab clicked:', clickedNav);
    await delay(1500);

    // 2. Open Bee Health Scan from Hives view
    console.log('Clicking "Scan a frame" button in Hives view...');
    const scanBtnClicked = await evaluate(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button, .hscan-btn, .hcard-btn-scan'));
        const scanBtn = btns.find(b => b.innerText.includes('Scan a frame') || b.innerText.includes('Scan'));
        if (scanBtn) {
          scanBtn.click();
          return true;
        }
        return false;
      })()
    `);
    console.log('Scan a frame button clicked:', scanBtnClicked);
    await delay(1500);

    // Screenshot 1: Camera Viewfinder with physical frame guide reticle
    await takeScreenshot('screen18_01_camera_viewfinder');

    // 3. Test shutter button click
    console.log('Triggering shutter capture button...');
    await evaluate(`
      (() => {
        const shutter = document.querySelector('.bhs-shutter-button');
        if (shutter) shutter.click();
      })()
    `);
    await delay(400);

    // Screenshot 2: Capturing state
    await takeScreenshot('screen18_02_capturing_state');

    await delay(1200); // Allow capture and validation to finish

    // Screenshot 3: Quality Validation (Image looks ready)
    await takeScreenshot('screen18_03_quality_validation');

    // 4. Click "Review frame"
    console.log('Clicking "Review frame"...');
    await evaluate(`
      (() => {
        const revBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Review frame'));
        if (revBtn) revBtn.click();
      })()
    `);
    await delay(800);

    // Screenshot 4: Review Screen (Large frame preview with prompt)
    await takeScreenshot('screen18_04_review_frame');

    // 5. Click "Analyze frame"
    console.log('Clicking "Analyze frame"...');
    await evaluate(`
      (() => {
        const anBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Analyze frame'));
        if (anBtn) anBtn.click();
      })()
    `);
    await delay(500);

    // Screenshot 5: Analysis Progress Animation
    await takeScreenshot('screen18_05_analyzing_progress');

    await delay(1800); // Wait for result generation

    // Screenshot 6: Screening Result (Possible signs detected - AFB)
    await takeScreenshot('screen18_06_screening_result_concerning');

    // Scroll down to view observations, safety notice, telemetry context, and observation note
    console.log('Scrolling down result view...');
    await evaluate(`
      (() => {
        const body = document.querySelector('.bhs-body-scroll');
        if (body) body.scrollTop = 450;
      })()
    `);
    await delay(600);
    await takeScreenshot('screen18_07_result_guidance_and_safety');

    // 6. Test Demo State Switcher: Switch to Healthy Brood Pattern
    console.log('Switching to Healthy Brood Pattern via Demo Switcher...');
    await evaluate(`
      (() => {
        const demoBtn = document.querySelector('.bhs-jury-toggle-btn');
        if (demoBtn) demoBtn.click();
      })()
    `);
    await delay(500);

    await evaluate(`
      (() => {
        const healthyBtn = Array.from(document.querySelectorAll('.bhs-chips-wrap button')).find(b => b.innerText.includes('Healthy brood pattern'));
        if (healthyBtn) healthyBtn.click();
      })()
    `);
    await delay(500);

    // Close demo switcher
    await evaluate(`
      (() => {
        const closeBtn = document.querySelector('.bhs-jury-close');
        if (closeBtn) closeBtn.click();
      })()
    `);
    await delay(600);

    // Screenshot 8: Healthy Brood Pattern (No concerning signs detected)
    await takeScreenshot('screen18_08_result_healthy_pattern');

    // 7. Test Demo State Switcher: Switch to Multiple Candidate Issues
    console.log('Switching to Multiple Candidate Issues...');
    await evaluate(`
      (() => {
        const demoBtn = document.querySelector('.bhs-jury-toggle-btn');
        if (demoBtn) demoBtn.click();
      })()
    `);
    await delay(400);

    await evaluate(`
      (() => {
        const multBtn = Array.from(document.querySelectorAll('.bhs-chips-wrap button')).find(b => b.innerText.includes('Multiple candidate'));
        if (multBtn) multBtn.click();
      })()
    `);
    await delay(400);

    await evaluate(`
      (() => {
        const closeBtn = document.querySelector('.bhs-jury-close');
        if (closeBtn) closeBtn.click();
      })()
    `);
    await delay(600);

    // Screenshot 9: Multiple Candidate Issues
    await takeScreenshot('screen18_09_result_multiple_candidates');

    // 8. Save Inspection to Hive
    console.log('Saving inspection to Hive...');
    await evaluate(`
      (() => {
        const saveBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Save inspection'));
        if (saveBtn) saveBtn.click();
      })()
    `);
    await delay(600);

    // Screenshot 10: Saved Confirmation
    await takeScreenshot('screen18_10_inspection_saved_confirmation');

    await delay(1600); // Allow modal to close and return to Hives view

    // Screenshot 11: Return to Hives view showing updated inspection badge
    await takeScreenshot('screen18_11_returned_to_hives_view');

    ws.close();
    console.log('Screen 18 verification completed successfully!');
  } finally {
    edge.kill();
  }
}

run().catch((e) => {
  console.error('Test failed:', e);
  process.exit(1);
});
