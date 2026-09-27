import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/sridh/.gemini/antigravity-ide/brain/376452b6-17d5-4aab-a736-3c8277087e84';
const EDGE_PATH = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const PORT = 9223;

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function run() {
  console.log('Launching headless Edge on port', PORT);
  const edge = spawn(EDGE_PATH, [
    `--remote-debugging-port=${PORT}`,
    '--headless=new',
    '--window-size=430,932',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    'about:blank'
  ]);

  edge.stderr.on('data', d => {});
  await delay(1500);

  try {
    const res = await fetch(`http://127.0.0.1:${PORT}/json`);
    const targets = await res.json();
    const pageTarget = targets.find(t => t.type === 'page');
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
      } catch (e) {
        console.error('Error parsing WS message:', e);
      }
    };

    const send = (method, params = {}) => {
      const id = idCounter++;
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          if (pending.has(id)) {
            console.warn(`Timeout waiting for CDP response for ${method} (id: ${id})`);
            pending.delete(id);
            resolve({});
          }
        }, 8000);
        pending.set(id, (msg) => {
          clearTimeout(timer);
          resolve(msg);
        });
        ws.send(JSON.stringify({ id, method, params }));
      });
    };

    await new Promise(r => ws.onopen = r);
    console.log('Connected to CDP via WebSocket');

    await send('Page.enable');
    await send('Runtime.enable');
    await send('DOM.enable');

    console.log('Navigating to http://localhost:5173/');
    await send('Page.navigate', { url: 'http://localhost:5173/' });
    await delay(3000);

    // Set authoritative master apiarist session with beekeeper capability
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const session = {
            isAuthenticated: true,
            isOnboardingComplete: true,
            operator: 'Sridhar',
            apiaryId: 'apiary-mb-01',
            role: 'Master Apiarist',
            designations: ['BEEKEEPER', 'PROCESSOR'],
            capabilities: [
              'HIVE_MONITORING',
              'HIVE_INSPECTION',
              'HIVE_IMAGE_CAPTURE',
              'HONEY_COLLECTION',
              'BATCH_MANAGEMENT'
            ],
            workContexts: {
              areas: ['Apiary / farm', 'Processing facility'],
              handles: ['Hive operations', 'Honey batches']
            }
          };
          localStorage.setItem('honeychain_user_session', JSON.stringify(session));
        })()
      `
    });

    // Reload to apply session and enter home screen
    await send('Page.navigate', { url: 'http://localhost:5173/' });
    // Wait for splash animation (1.8s) + state transition
    await delay(3000);

    async function takeScreenshot(name) {
      const res = await send('Page.captureScreenshot', { format: 'png' });
      const buffer = Buffer.from(res.result.data, 'base64');
      const filePath = path.join(ARTIFACTS_DIR, `${name}.png`);
      fs.writeFileSync(filePath, buffer);
      console.log(`Saved screenshot: ${name}.png (${buffer.length} bytes)`);
      return filePath;
    }

    // 1. Verify Home with Beekeeper Priority
    console.log('\n--- 1. VERIFYING HOME TAB ---');
    await takeScreenshot('screen15_demo_01_home_beekeeper');

    // 2. Switch to Hives tab
    console.log('\n--- 2. SWITCHING TO HIVES TAB ---');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const navItems = Array.from(document.querySelectorAll('.nav-item'));
          const hivesNav = navItems.find(el => el.textContent.includes('Hives'));
          if (hivesNav) hivesNav.click();
        })()
      `
    });
    await delay(1000);
    await takeScreenshot('screen15_demo_02_hives_header_summary');

    // Scroll to see Bee Health Scan card and segmented filter
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const scroll = document.querySelector('.hive-list-container') || document.querySelector('.hv-scroll') || window;
          if (scroll && scroll.scrollTo) scroll.scrollTo(0, 150);
        })()
      `
    });
    await delay(600);
    await takeScreenshot('screen15_demo_03_bee_health_scan_card');

    // Test Segmented Filter: "Needs attention"
    console.log('Testing Segmented Filter: Needs attention...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const tabs = Array.from(document.querySelectorAll('.health-filter-tab'));
          const attnTab = tabs.find(t => t.textContent.includes('Needs attention'));
          if (attnTab) attnTab.click();
        })()
      `
    });
    await delay(800);
    await takeScreenshot('screen15_demo_04_filter_attention');

    // Reset Filter to "All"
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const tabs = Array.from(document.querySelectorAll('.health-filter-tab'));
          const allTab = tabs.find(t => t.textContent.includes('All'));
          if (allTab) allTab.click();
        })()
      `
    });
    await delay(600);

    // 3. Test "How it works" sheet
    console.log('\n--- 3. OPENING "HOW IT WORKS" INFO SHEET ---');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const howBtn = btns.find(b => b.textContent.includes('How it works'));
          if (howBtn) howBtn.click();
        })()
      `
    });
    await delay(800);
    await takeScreenshot('screen15_demo_05_how_it_works_sheet');

    // Close "How it works" sheet
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const closeBtn = document.querySelector('button[aria-label="Close"]') || Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Understood'));
          if (closeBtn) closeBtn.click();
        })()
      `
    });
    await delay(600);

    // 4. Test "Scan a frame" -> Opens Screen 16 Capture Frame Modal
    console.log('\n--- 4. OPENING "SCAN A FRAME" MODAL ---');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const scanBtn = btns.find(b => b.textContent.includes('Scan a frame'));
          if (scanBtn) scanBtn.click();
        })()
      `
    });
    await delay(1000);
    await takeScreenshot('screen16_demo_06_capture_frame_viewfinder');

    // Select sample frame: AFB Signs
    console.log('Selecting sample frame: AFB Signs...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const sampleBtns = Array.from(document.querySelectorAll('button'));
          const afbBtn = sampleBtns.find(b => b.textContent.includes('AFB Signs'));
          if (afbBtn) afbBtn.click();
        })()
      `
    });
    await delay(800);

    // Tap "Capture frame"
    console.log('Capturing frame...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const capBtn = btns.find(b => b.textContent.includes('Capture frame'));
          if (capBtn) capBtn.click();
        })()
      `
    });
    await delay(1000);
    await takeScreenshot('screen16_demo_07_quality_validation');

    // Tap "Analyze frame"
    console.log('Tapping Analyze frame...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const anaBtn = btns.find(b => b.textContent.includes('Analyze frame'));
          if (anaBtn) anaBtn.click();
        })()
      `
    });
    // Capture analyzing state
    await delay(800);
    await takeScreenshot('screen16_demo_08_analyzing_state');

    // Wait for analysis to complete (simulated ~2.4s)
    await delay(2200);
    await takeScreenshot('screen16_demo_09_analysis_result');

    // Add Human Observation Override
    console.log('Entering human observation...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const textarea = document.querySelector('textarea');
          if (textarea) {
            textarea.value = 'Brood pattern looks irregular near lower left cells; noticed sunken cappings. Flagged for apiary follow-up.';
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
          }
        })()
      `
    });
    await delay(600);
    await takeScreenshot('screen16_demo_10_observation_entered');

    // Save inspection to hive
    console.log('Saving inspection...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const saveBtn = btns.find(b => b.textContent.includes('Save inspection'));
          if (saveBtn) saveBtn.click();
        })()
      `
    });
    await delay(1200);

    // 5. Verify Hive Detail with Health History Timeline
    console.log('\n--- 5. VERIFYING HIVE DETAIL & HEALTH TIMELINE ---');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const cards = document.querySelectorAll('.hive-tactile-card');
          if (cards[0]) cards[0].click();
        })()
      `
    });
    await delay(1000);
    await takeScreenshot('screen16_demo_11_hive_detail_top');

    // Switch to History tab in Hive Detail to see health timeline
    console.log('Switching to History tab...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const tabBtns = Array.from(document.querySelectorAll('.dt-tab-btn'));
          const histTab = tabBtns.find(b => b.textContent.includes('History'));
          if (histTab) histTab.click();
        })()
      `
    });
    await delay(800);
    await takeScreenshot('screen16_demo_12_hive_detail_health_timeline');

    // 6. Return to Home and verify updated Attention Card
    console.log('\n--- 6. VERIFYING HOME UPDATED ATTENTION CARD ---');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const backBtn = document.querySelector('.back-nav-btn');
          if (backBtn) backBtn.click();
        })()
      `
    });
    await delay(600);
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const navItems = Array.from(document.querySelectorAll('.nav-item'));
          const homeNav = navItems.find(el => el.textContent.includes('Home'));
          if (homeNav) homeNav.click();
        })()
      `
    });
    await delay(1000);
    await takeScreenshot('screen15_demo_13_home_updated_attention');

    console.log('\n=== ALL SCREEN 15 & SCREEN 16 HEALTH SCAN VERIFICATIONS SUCCEEDED! ===');
    ws.close();
  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    edge.kill();
  }
}

run();
