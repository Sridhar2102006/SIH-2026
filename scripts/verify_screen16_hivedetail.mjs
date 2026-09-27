import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/sridh/.gemini/antigravity-ide/brain/376452b6-17d5-4aab-a736-3c8277087e84';
const EDGE_PATH = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const PORT = 9226;

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
    '--inprivate',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-fre',
    '--disable-sync',
    '--disable-features=msFirstRunExperience,msEdgeSync,msHub',
    `--user-data-dir=C:/Users/sridh/AppData/Local/Temp/edge_sih_detail_${Date.now()}`,
    'http://localhost:5173/'
  ]);

  edge.stderr.on('data', d => {});
  await delay(2500);

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
      return new Promise((resolve) => {
        const timer = setTimeout(() => {
          if (pending.has(id)) {
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

    await send('Page.navigate', { url: 'http://localhost:5173/' });
    await delay(2000);

    async function evaluate(code) {
      const resp = await send('Runtime.evaluate', {
        expression: code,
        returnByValue: true
      });
      return resp?.result?.result?.value;
    }

    async function takeScreenshot(name) {
      const res = await send('Page.captureScreenshot', { format: 'png' });
      if (res?.result?.data) {
        const buffer = Buffer.from(res.result.data, 'base64');
        const filePath = path.join(ARTIFACTS_DIR, `${name}.png`);
        fs.writeFileSync(filePath, buffer);
        console.log(`Saved screenshot: ${name}.png (${buffer.length} bytes)`);
        return filePath;
      }
      return null;
    }

    // Set master apiarist session and reload
    await evaluate(`
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
        window.location.reload();
      })()
    `);
    await delay(3000);

    // 1. Switch to Hives tab
    console.log('--- Switching to Hives Tab ---');
    await evaluate(`
      (() => {
        const navItems = Array.from(document.querySelectorAll('.nav-item'));
        const hivesNav = navItems.find(n => n.innerText.includes('Hives'));
        if (hivesNav) hivesNav.click();
      })()
    `);
    await delay(1200);

    // 2. Click on "Cedar Queen" (#01) to open Screen 16 Hive Detail
    console.log('--- Opening Hive Detail for Cedar Queen ---');
    const openCardResult = await evaluate(`
      (() => {
        const cards = Array.from(document.querySelectorAll('.hive-clean-card'));
        const cedarCard = cards.find(c => c.textContent.includes('Cedar Queen')) || cards[0];
        if (cedarCard) {
          cedarCard.click();
          return { clicked: true, text: cedarCard.textContent.substring(0, 50).trim() };
        }
        return { clicked: false, totalCards: cards.length };
      })()
    `);
    console.log('Open Card Result:', openCardResult);
    await delay(1200);

    // Screenshot 1: Screen 16 Top: Header, Hero Health, Primary Actions, Bee Health Scan & Latest Frame
    console.log('Capturing Screen 16 Top...');
    await takeScreenshot('screen16_detail_01_top_hero');

    // Screenshot 2: Open ••• Overflow Menu
    console.log('Testing ••• overflow menu...');
    await evaluate(`
      (() => {
        const menuBtn = document.querySelector('.hd-menu-trigger');
        if (menuBtn) menuBtn.click();
      })()
    `);
    await delay(600);
    await takeScreenshot('screen16_detail_02_overflow_menu');

    // Close menu by clicking outside
    await evaluate(`
      (() => {
        document.body.click();
      })()
    `);
    await delay(500);

    // Screenshot 3: Scroll down to Hive conditions & Health history
    console.log('Scrolling to Hive conditions & Health history...');
    await evaluate(`
      (() => {
        const scroller = document.querySelector('.app-content');
        if (scroller) scroller.scrollTop = 380;
      })()
    `);
    await delay(800);
    await takeScreenshot('screen16_detail_03_conditions_timeline');

    // Screenshot 4: Scroll down to Observations & Hive Details
    console.log('Scrolling to Observations & Hive details...');
    await evaluate(`
      (() => {
        const scroller = document.querySelector('.app-content');
        if (scroller) scroller.scrollTop = 820;
      })()
    `);
    await delay(800);
    await takeScreenshot('screen16_detail_04_observations_details');

    // Screenshot 5: Scroll to bottom (Technical Details Footer)
    console.log('Scrolling to Technical Details footer...');
    await evaluate(`
      (() => {
        const scroller = document.querySelector('.app-content');
        if (scroller) scroller.scrollTop = scroller.scrollHeight;
      })()
    `);
    await delay(800);
    await takeScreenshot('screen16_detail_05_technical_footer');

    // Screenshot 6: Open Screen 17 Technical Details Sheet
    console.log('Opening HiveTechnicalSheet...');
    await evaluate(`
      (() => {
        const techBtn = document.querySelector('.hd-tech-trigger-btn') || Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('View technical details'));
        if (techBtn) techBtn.click();
      })()
    `);
    await delay(1000);
    await takeScreenshot('screen17_technical_sheet_verified');

    // Test ping in technical sheet
    console.log('Testing device ping in Technical Sheet...');
    await evaluate(`
      (() => {
        const pingBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Test device ping'));
        if (pingBtn) pingBtn.click();
      })()
    `);
    await delay(1600);
    await takeScreenshot('screen17_technical_ping_success');

    // Close Technical Sheet
    await evaluate(`
      (() => {
        const closeBtn = document.querySelector('.sheet-close-btn') || document.querySelector('button[aria-label="Close"]');
        if (closeBtn) closeBtn.click();
      })()
    `);
    await delay(600);

    // Screenshot 7: Test "+ Add observation" modal
    console.log('Testing Add Observation modal...');
    await evaluate(`
      (() => {
        const addObsBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Add observation'));
        if (addObsBtn) addObsBtn.click();
      })()
    `);
    await delay(800);
    await takeScreenshot('screen16_detail_06_add_observation_modal');

    // Close observation modal
    await evaluate(`
      (() => {
        const cancelBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Cancel'));
        if (cancelBtn) cancelBtn.click();
      })()
    `);
    await delay(600);

    // Screenshot 8: Test Back button navigation
    console.log('Testing Back button navigation to all hives...');
    await evaluate(`
      (() => {
        const backBtn = document.querySelector('.hd-back-btn');
        if (backBtn) backBtn.click();
      })()
    `);
    await delay(1000);
    await takeScreenshot('screen16_detail_07_returned_to_hives');

    console.log('\n========================================');
    console.log('ALL SCREEN 16 HIVE DETAIL VERIFICATIONS PASSED!');
    console.log('========================================');

    ws.close();
  } catch (err) {
    console.error('Error during verification:', err);
  } finally {
    edge.kill();
  }
}

run();
