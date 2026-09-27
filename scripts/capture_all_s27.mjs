import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/sridh/.gemini/antigravity-ide/brain/376452b6-17d5-4aab-a736-3c8277087e84';
const EDGE_PATH = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const PORT = 9391;

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  const userDataDir = `C:/Users/sridh/AppData/Local/Temp/edge_sih_s27_clean_${Date.now()}`;
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
    await send('Page.enable');
    await send('Runtime.enable');
    ws.addEventListener('message', (e) => {
      const m = JSON.parse(e.data);
      if (m.method === 'Runtime.consoleAPICalled' || m.method === 'Runtime.exceptionThrown') {
        console.log('BROWSER ERR/LOG:', JSON.stringify(m.params));
      }
    });
    await send('DOM.enable');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 430,
      height: 932,
      deviceScaleFactor: 2,
      mobile: true
    });

    // Seed session in localStorage
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const session = {
            id: 'usr-sarah-lindqvist',
            name: 'Sarah Lindqvist',
            email: 'sarah.lindqvist@honeychain.io',
            role: 'beekeeper',
            apiary: 'Meadowbrook Apiary',
            designation: 'QUALITY',
            capabilities: ['HIVE_MONITORING', 'BATCH_CREATE', 'COLLECTION_VIEW', 'QUALITY_TESTING', 'QUALITY_VIEW', 'QUALITY_RECORD', 'QUALITY_APPROVE', 'BATCH_VERIFY', 'PROOF_VIEW', 'PROOF_CREATE', 'PROOF_RETRY'],
            designations: ['BEEKEEPER', 'PROCESSOR', 'QUALITY', 'DISTRIBUTOR'],
            isAuthenticated: true,
            requiresVerification: false,
            isOnboardingComplete: true
          };
          localStorage.setItem('honeychain_user_session', JSON.stringify(session));
        })()
      `
    });

    await send('Page.navigate', { url: 'http://localhost:5173/' });
    await delay(5000);

    // Helper to set scenario & scroll
    const setScenario = async (sc, scrollTop = 0) => {
      const res = await send('Runtime.evaluate', {
        expression: `(() => {
          if (window.__openTechnicalProof) {
            window.__openTechnicalProof({
              batchId: 'batch-hc-2409',
              scenario: '${sc}'
            });
          }
          if (window.__setTechnicalProofScenario) {
            window.__setTechnicalProofScenario('${sc}');
          }
          const el = document.querySelector('.tech-screen-overlay');
          if (el) el.scrollTop = ${scrollTop};
          return {
            hasOverlay: Boolean(el),
            heroText: document.querySelector('.tech-hero-title')?.innerText,
            scrollHeight: el?.scrollHeight
          };
        })()`,
        returnByValue: true
      });
      console.log('Set ' + sc + ' -> ', res.result?.value);
      await delay(700);
    };

    // ─────────────────────────────────────────────────────────────
    // 1. Confirmed Hero
    // ─────────────────────────────────────────────────────────────
    console.log('1. Capturing Confirmed Hero...');
    await setScenario('confirmed', 0);
    const shot1 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(
      path.join(ARTIFACTS_DIR, 'screen27_01_confirmed_hero.png'),
      Buffer.from(shot1.result.data, 'base64')
    );

    // ─────────────────────────────────────────────────────────────
    // 2. Details & Timeline
    // ─────────────────────────────────────────────────────────────
    console.log('2. Capturing Details & Timeline...');
    await setScenario('confirmed', 480);
    const shot2 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(
      path.join(ARTIFACTS_DIR, 'screen27_02_details_and_timeline.png'),
      Buffer.from(shot2.result.data, 'base64')
    );

    // ─────────────────────────────────────────────────────────────
    // 3. Advanced Technical Details
    // ─────────────────────────────────────────────────────────────
    console.log('3. Capturing Advanced Details Accordion...');
    await setScenario('confirmed', 0);
    await send('Runtime.evaluate', {
      expression: `
        const b = document.querySelector('.tech-advanced-toggle-btn');
        if (b) b.click();
      `
    });
    await delay(500);
    await send('Runtime.evaluate', {
      expression: `
        const el = document.querySelector('.tech-screen-overlay');
        if (el) el.scrollTop = el.scrollHeight;
      `
    });
    await delay(600);
    const shot3 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(
      path.join(ARTIFACTS_DIR, 'screen27_03_advanced_details.png'),
      Buffer.from(shot3.result.data, 'base64')
    );

    // ─────────────────────────────────────────────────────────────
    // 4. Pending State
    // ─────────────────────────────────────────────────────────────
    console.log('4. Capturing Pending State...');
    await setScenario('pending', 0);
    const shot4 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(
      path.join(ARTIFACTS_DIR, 'screen27_04_pending_status.png'),
      Buffer.from(shot4.result.data, 'base64')
    );

    // ─────────────────────────────────────────────────────────────
    // 5. Failed State with Retry
    // ─────────────────────────────────────────────────────────────
    console.log('5. Capturing Failed State...');
    await setScenario('failed', 0);
    const shot5 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(
      path.join(ARTIFACTS_DIR, 'screen27_05_failed_retry.png'),
      Buffer.from(shot5.result.data, 'base64')
    );

    // ─────────────────────────────────────────────────────────────
    // 6. Stale State / Needs Review
    // ─────────────────────────────────────────────────────────────
    console.log('6. Capturing Stale State...');
    await setScenario('stale', 0);
    const shot6 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(
      path.join(ARTIFACTS_DIR, 'screen27_06_stale_needs_review.png'),
      Buffer.from(shot6.result.data, 'base64')
    );

    // ─────────────────────────────────────────────────────────────
    // 7. Not Created State & Confirmation Modal
    // ─────────────────────────────────────────────────────────────
    console.log('7. Capturing Not Created Modal...');
    await setScenario('not_created', 0);
    await send('Runtime.evaluate', {
      expression: `
        const createBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Create technical proof'));
        if (createBtn) createBtn.click();
      `
    });
    await delay(600);
    const shot7 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(
      path.join(ARTIFACTS_DIR, 'screen27_07_create_proof_modal.png'),
      Buffer.from(shot7.result.data, 'base64')
    );

    // ─────────────────────────────────────────────────────────────
    // 8. Full Hash Modal
    // ─────────────────────────────────────────────────────────────
    console.log('8. Capturing Full Hash Modal...');
    await send('Runtime.evaluate', {
      expression: `
        const cancelBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Cancel'));
        if (cancelBtn) cancelBtn.click();
      `
    });
    await delay(300);
    await setScenario('confirmed', 320);
    await send('Runtime.evaluate', {
      expression: `
        const viewBtns = Array.from(document.querySelectorAll('.tproof-mini-btn')).filter(b => b.textContent.trim() === 'View');
        if (viewBtns.length > 0) viewBtns[0].click();
      `
    });
    await delay(600);
    const shot8 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(
      path.join(ARTIFACTS_DIR, 'screen27_08_full_hash_modal.png'),
      Buffer.from(shot8.result.data, 'base64')
    );

    console.log('All 8 Screen 27 technical proof screenshots captured cleanly!');
    ws.close();
  } catch (e) {
    console.error('Error during execution:', e);
  } finally {
    edge.kill();
  }
}

run();
