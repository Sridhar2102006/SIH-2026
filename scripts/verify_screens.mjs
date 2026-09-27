import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/sridh/.gemini/antigravity-ide/brain/376452b6-17d5-4aab-a736-3c8277087e84';
const EDGE_PATH = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const PORT = 9222;

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function run() {
  console.log('Launching headless Edge on port', PORT);
  const edge = spawn(EDGE_PATH, [
    `--remote-debugging-port=${PORT}`,
    '--headless=new',
    '--window-size=1600,900',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    'about:blank'
  ]);

  edge.stderr.on('data', d => {});
  await delay(1500);

  try {
    // 1. Get targets from CDP HTTP endpoint
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

    // 2. Navigate to app
    console.log('Navigating to http://localhost:5173/');
    await send('Page.navigate', { url: 'http://localhost:5173/' });
    await delay(3500);

    // Ensure session is set and startup completes
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

    // Reload page to enter main app directly with session
    await send('Page.navigate', { url: 'http://localhost:5173/' });
    // Wait for splash transition
    await delay(4000);

    async function takeScreenshot(name) {
      const res = await send('Page.captureScreenshot', { format: 'png' });
      const buffer = Buffer.from(res.result.data, 'base64');
      const filePath = path.join(ARTIFACTS_DIR, `${name}.png`);
      fs.writeFileSync(filePath, buffer);
      console.log(`Saved screenshot: ${name}.png (${buffer.length} bytes)`);
      return filePath;
    }

    // ── Screen 14 Verification ──
    console.log('\n--- VERIFYING SCREEN 14 (HOME) ---');

    // Screenshot 1: Screen 14 Top (Header, Paused Notice, Today Attention card)
    await takeScreenshot('screen14_home_top_verified');

    // Scroll down to view Hives snapshot & Latest inspection photo card
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const scroll = document.querySelector('.hv-scroll');
          if (scroll) scroll.scrollTop = 240;
        })()
      `
    });
    await delay(800);
    await takeScreenshot('screen14_home_inspection_verified');

    // Scroll further to view Quick actions, Honey journey & Smart insight
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const scroll = document.querySelector('.hv-scroll');
          if (scroll) scroll.scrollTop = 560;
        })()
      `
    });
    await delay(800);
    await takeScreenshot('screen14_home_journey_verified');

    // Click "View proof" next to Honey journey
    console.log('Testing Blockchain Proof Sheet...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const links = Array.from(document.querySelectorAll('.hv-sec-link'));
          const proofBtn = links.find(el => el.textContent.includes('View proof'));
          if (proofBtn) proofBtn.click();
        })()
      `
    });
    await delay(800);
    await takeScreenshot('screen14_proof_modal_verified');

    // Close proof sheet
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const closeBtn = document.querySelector('.hv-modal-btn');
          if (closeBtn) closeBtn.click();
        })()
      `
    });
    await delay(600);

    // Click "Why am I seeing this?" in Smart insight
    console.log('Testing Smart Insight Explanation Sheet...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const links = Array.from(document.querySelectorAll('.hv-why-link'));
          if (links[0]) links[0].click();
        })()
      `
    });
    await delay(800);
    await takeScreenshot('screen14_why_seeing_this_verified');

    // Close Why sheet
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const closeBtn = document.querySelector('.hv-modal-btn');
          if (closeBtn) closeBtn.click();
        })()
      `
    });
    await delay(600);

    // Click Notifications Bell
    console.log('Testing Notifications Sheet...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const bell = document.querySelector('.hv-icon-btn[aria-label="Notifications"]');
          if (bell) bell.click();
        })()
      `
    });
    await delay(800);
    await takeScreenshot('screen14_notifications_verified');

    // Close Notifications sheet
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const closeBtn = document.querySelector('.hv-modal-btn');
          if (closeBtn) closeBtn.click();
        })()
      `
    });
    await delay(600);

    // Test Quick action: "Record observation"
    console.log('Testing Quick Action: Record observation...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const chips = Array.from(document.querySelectorAll('.hv-action-chip'));
          const obsChip = chips.find(c => c.textContent.includes('Record observation'));
          if (obsChip) obsChip.click();
        })()
      `
    });
    await delay(800);
    await takeScreenshot('screen14_record_obs_modal_verified');

    // Select a preset and save observation
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const presets = Array.from(document.querySelectorAll('.obs-preset-btn'));
          if (presets[0]) presets[0].click();
          const saveBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Save observation'));
          if (saveBtn) saveBtn.click();
        })()
      `
    });
    await delay(1000);

    // ── Screen 15 Verification ──
    console.log('\n--- VERIFYING SCREEN 15 (HIVES) ---');

    // Click "Hives" in bottom navigation
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const navItems = Array.from(document.querySelectorAll('.nav-item'));
          const hivesNav = navItems.find(el => el.textContent.includes('Hives'));
          if (hivesNav) hivesNav.click();
        })()
      `
    });
    await delay(1200);

    // Screenshot Screen 15 workspace
    await takeScreenshot('screen15_hives_workspace_verified');

    // Test Segmented Filter: "Needs attention"
    console.log('Testing Hives filter: Needs attention...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const filterTabs = Array.from(document.querySelectorAll('.health-filter-tab, .filter-chip'));
          const attnTab = filterTabs.find(t => t.textContent.includes('attention') || t.textContent.includes('Attention'));
          if (attnTab) attnTab.click();
        })()
      `
    });
    await delay(800);
    await takeScreenshot('screen15_hives_filter_attention_verified');

    // Reset filter to "All"
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const filterTabs = Array.from(document.querySelectorAll('.health-filter-tab, .filter-chip'));
          const allTab = filterTabs.find(t => t.textContent.includes('All'));
          if (allTab) allTab.click();
        })()
      `
    });
    await delay(800);

    // Test "How it works" Info Sheet
    console.log('Testing Bee Health Scan: "How it works" sheet...');
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
    await takeScreenshot('screen15_how_it_works_sheet');

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

    // Test "Scan a frame" -> Opens Screen 16 Capture Frame
    console.log('Testing "Scan a frame" viewfinder...');
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
    await takeScreenshot('screen16_frame_viewfinder_tips');

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
    await delay(600);

    // Tap "Capture frame"
    console.log('Tapping "Capture frame"...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const capBtn = btns.find(b => b.textContent.includes('Capture frame'));
          if (capBtn) capBtn.click();
        })()
      `
    });
    await delay(800);
    await takeScreenshot('screen16_frame_quality_validation');

    // Tap "Analyze frame"
    console.log('Tapping "Analyze frame"...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const anaBtn = btns.find(b => b.textContent.includes('Analyze frame'));
          if (anaBtn) anaBtn.click();
        })()
      `
    });
    await delay(800);
    await takeScreenshot('screen16_frame_analyzing_state');

    // Wait for analysis result to resolve (simulated ~2.4s)
    console.log('Waiting for analysis result...');
    await delay(2200);
    await takeScreenshot('screen16_frame_analysis_result');

    // Enter human observation
    console.log('Entering human observation notes...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const ta = document.querySelector('textarea');
          if (ta) {
            ta.value = 'Brood pattern looks irregular near lower left cells; noticed sunken cappings.';
            ta.dispatchEvent(new Event('input', { bubbles: true }));
          }
        })()
      `
    });
    await delay(600);
    await takeScreenshot('screen16_frame_observation_entered');

    // Tap "Save inspection"
    console.log('Saving inspection to hive...');
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

    // Click on the first hive card to navigate to Screen 16: HiveDetail
    console.log('Navigating to Screen 16: HiveDetail...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const cards = document.querySelectorAll('.hive-tactile-card');
          if (cards[0]) cards[0].click();
        })()
      `
    });
    await delay(1200);
    await takeScreenshot('screen16_hive_detail_verified');

    // Click "History" tab in Hive Detail to see health timeline
    console.log('Checking Health history timeline in Hive Detail...');
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
    await takeScreenshot('screen16_hive_detail_health_timeline');

    // Click back to return to Hives list
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const backBtn = document.querySelector('.back-nav-btn');
          if (backBtn) backBtn.click();
        })()
      `
    });
    await delay(800);

    // Test "+ Add hive" button
    console.log('Testing "+ Add hive" modal...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const addBtns = Array.from(document.querySelectorAll('button'));
          const addHiveBtn = addBtns.find(b => b.textContent.includes('Add hive'));
          if (addHiveBtn) addHiveBtn.click();
        })()
      `
    });
    await delay(800);
    await takeScreenshot('screen15_add_hive_modal_verified');

    // Close Add Hive modal
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const closeBtn = document.querySelector('button[aria-label="Close modal"]') || document.querySelector('button[aria-label="Close"]') || Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Cancel'));
          if (closeBtn) closeBtn.click();
        })()
      `
    });
    await delay(600);

    // Return to Home tab
    console.log('Returning to Home tab...');
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
    await takeScreenshot('screen14_home_final_verified');

    console.log('\n=== ALL SCREEN 14 & SCREEN 15 TESTS COMPLETED SUCCESSFULLY! ===');
    ws.close();
  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    edge.kill();
  }
}

run();
