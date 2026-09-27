import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/sridh/.gemini/antigravity-ide/brain/376452b6-17d5-4aab-a736-3c8277087e84';
const EDGE_PATH = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const PORT = 9233;

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function run() {
  console.log('Launching headless Edge for verification on port', PORT);
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
    `--user-data-dir=C:/Users/sridh/AppData/Local/Temp/edge_sih_fix_${Date.now()}`,
    'http://localhost:5173/'
  ]);

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
      } catch (e) {}
    };

    const send = (method, params = {}) => {
      const id = idCounter++;
      return new Promise((resolve) => {
        pending.set(id, (msg) => resolve(msg));
        ws.send(JSON.stringify({ id, method, params }));
      });
    };

    await new Promise(resolve => ws.onopen = resolve);
    console.log('Connected to CDP via WebSocket');

    await send('Page.enable');
    await send('Runtime.enable');
    await send('DOM.enable');

    await send('Page.navigate', { url: 'http://localhost:5173/' });
    await delay(2500);

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
    await delay(1500);

    // 2. Check header, scroll metrics, and duplicate elements
    const hivesInspection = await evaluate(`
      (() => {
        const appContent = document.querySelector('.app-content');
        const topbarTitle = document.querySelector('.topbar-title')?.textContent;
        const hivesTitle = document.querySelector('.hives-title')?.textContent;
        const hivesSub = document.querySelector('.hives-supporting-text')?.textContent;
        const addHiveButtons = Array.from(document.querySelectorAll('button')).filter(b => b.textContent.includes('Add hive'));
        const fabBtn = document.querySelector('.fab-add-hive');
        const cards = Array.from(document.querySelectorAll('.hive-clean-card')).map(c => c.querySelector('.hcard-name')?.textContent);

        return {
          topbarTitle,
          hivesTitle,
          hivesSub,
          addHiveButtonCount: addHiveButtons.length,
          addHiveButtonClasses: addHiveButtons.map(b => b.className),
          hasFab: Boolean(fabBtn),
          cardsCount: cards.length,
          cards,
          scrollMetrics: {
            scrollHeight: appContent?.scrollHeight,
            clientHeight: appContent?.clientHeight,
            scrollTop: appContent?.scrollTop,
            canScroll: (appContent?.scrollHeight || 0) > (appContent?.clientHeight || 0)
          }
        };
      })()
    `);

    console.log('Hives View Inspection Result:', JSON.stringify(hivesInspection, null, 2));
    await takeScreenshot('hives_fixed_01_top_view');

    // 3. Test scrolling down
    console.log('--- Testing Smooth Scroll ---');
    await evaluate(`
      (() => {
        const appContent = document.querySelector('.app-content');
        if (appContent) {
          appContent.scrollTop = 320;
        }
      })()
    `);
    await delay(800);

    const scrolledMetrics = await evaluate(`
      (() => {
        const appContent = document.querySelector('.app-content');
        return {
          scrollTop: appContent?.scrollTop,
          scrolledSuccessfully: (appContent?.scrollTop || 0) > 0
        };
      })()
    `);
    console.log('Scrolled Metrics:', scrolledMetrics);
    await takeScreenshot('hives_fixed_02_scrolled_view');

    // 4. Test clicking a card to open Hive Detail
    console.log('--- Opening Hive Detail (Cedar Queen) ---');
    await evaluate(`
      (() => {
        const card = document.querySelector('.hive-clean-card');
        if (card) card.click();
      })()
    `);
    await delay(1500);

    const detailCheck = await evaluate(`
      (() => {
        const hasTopBar = Boolean(document.querySelector('.topbar'));
        const detailTitle = document.querySelector('.hd-title')?.textContent;
        const detailBack = Boolean(document.querySelector('.hd-back-btn'));
        const appContent = document.querySelector('.app-content');

        return {
          hasTopBar, // Should be false! TopBar is hidden to prevent duplicate header
          detailTitle,
          detailBack,
          scrollMetrics: {
            scrollHeight: appContent?.scrollHeight,
            clientHeight: appContent?.clientHeight,
            scrollTop: appContent?.scrollTop,
            canScroll: (appContent?.scrollHeight || 0) > (appContent?.clientHeight || 0)
          }
        };
      })()
    `);
    console.log('Detail Check Result:', detailCheck);
    await takeScreenshot('hives_fixed_03_detail_no_duplicate_topbar');

    // Scroll down on Hive Detail
    await evaluate(`
      (() => {
        const appContent = document.querySelector('.app-content');
        if (appContent) {
          appContent.scrollTop = 500;
        }
      })()
    `);
    await delay(800);
    await takeScreenshot('hives_fixed_04_detail_scrolled');

    // 5. Navigate back to Hives
    console.log('--- Navigating back to All Hives ---');
    await evaluate(`
      (() => {
        const backBtn = document.querySelector('.hd-back-btn');
        if (backBtn) backBtn.click();
      })()
    `);
    await delay(1200);

    const returnCheck = await evaluate(`
      (() => {
        const hasTopBar = Boolean(document.querySelector('.topbar'));
        const hivesTitle = document.querySelector('.hives-title')?.textContent;
        return { hasTopBar, hivesTitle };
      })()
    `);
    console.log('Returned to Hives List Check:', returnCheck);
    await takeScreenshot('hives_fixed_05_returned_to_hives');

    ws.close();
  } finally {
    edge.kill();
  }
}

run().catch(console.error);
