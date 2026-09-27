import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/sridh/.gemini/antigravity-ide/brain/376452b6-17d5-4aab-a736-3c8277087e84';
const EDGE_PATH = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const PORT = 9398;

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  const userDataDir = `C:/Users/sridh/AppData/Local/Temp/edge_sih_s27_v3_${Date.now()}`;
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

    // ─────────────────────────────────────────────────────────────
    // 1. CONFIRMED STATE HERO & SEPARATION CHIPS
    // ─────────────────────────────────────────────────────────────
    console.log('Opening Screen 27: Confirmed Proof scenario...');
    await send('Runtime.evaluate', {
      expression: `
        if (window.__openTechnicalProof) {
          window.__openTechnicalProof({
            batchId: 'batch-hc-2409',
            scenario: 'confirmed'
          });
        }
        const overlay = document.querySelector('.tech-screen-overlay');
        if (overlay) overlay.scrollTop = 0;
        const hero = document.querySelector('.tech-hero-card');
        if (hero) hero.scrollIntoView({ block: 'start' });
      `
    });
    await delay(1200);

    console.log('Capturing Screenshot 1: Confirmed Proof Hero & Separation Chips...');
    const shot1 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(
      path.join(ARTIFACTS_DIR, 'screen27_01_confirmed_hero.png'),
      Buffer.from(shot1.result.data, 'base64')
    );

    // ─────────────────────────────────────────────────────────────
    // 2. SCROLL DOWN: DETAILS, EXPLANATION & TIMELINE
    // ─────────────────────────────────────────────────────────────
    console.log('Scrolling down to Details, Explanations & Timeline...');
    await send('Runtime.evaluate', {
      expression: `
        const card = document.querySelector('.tech-proof-card');
        if (card) card.scrollIntoView({ block: 'start' });
      `
    });
    await delay(800);

    console.log('Capturing Screenshot 2: Details, Explanation & Timeline...');
    const shot2 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(
      path.join(ARTIFACTS_DIR, 'screen27_02_details_and_timeline.png'),
      Buffer.from(shot2.result.data, 'base64')
    );

    // ─────────────────────────────────────────────────────────────
    // 3. ADVANCED TECHNICAL DETAILS ACCORDION
    // ─────────────────────────────────────────────────────────────
    console.log('Expanding Advanced Technical Details Accordion...');
    await send('Runtime.evaluate', {
      expression: `
        const advBtn = document.querySelector('.tech-advanced-toggle-btn');
        if (advBtn) advBtn.click();
      `
    });
    await delay(500);

    await send('Runtime.evaluate', {
      expression: `
        const advPanel = document.querySelector('.tech-advanced-panel');
        if (advPanel) advPanel.scrollIntoView({ block: 'center' });
      `
    });
    await delay(800);

    console.log('Capturing Screenshot 3: Advanced Technical Details Accordion...');
    const shot3 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(
      path.join(ARTIFACTS_DIR, 'screen27_03_advanced_details.png'),
      Buffer.from(shot3.result.data, 'base64')
    );

    // ─────────────────────────────────────────────────────────────
    // 4. PENDING STATE (Verified + Proof Pending)
    // ─────────────────────────────────────────────────────────────
    console.log('Switching to Pending scenario...');
    await send('Runtime.evaluate', {
      expression: `
        if (window.__setTechnicalProofScenario) {
          window.__setTechnicalProofScenario('pending');
        }
        const overlay = document.querySelector('.tech-screen-overlay');
        if (overlay) overlay.scrollTop = 0;
        const hero = document.querySelector('.tech-hero-card');
        if (hero) hero.scrollIntoView({ block: 'start' });
      `
    });
    await delay(1000);

    console.log('Capturing Screenshot 4: Pending State...');
    const shot4 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(
      path.join(ARTIFACTS_DIR, 'screen27_04_pending_status.png'),
      Buffer.from(shot4.result.data, 'base64')
    );

    // ─────────────────────────────────────────────────────────────
    // 5. FAILED STATE (Verified + Proof Failed / Retry CTA)
    // ─────────────────────────────────────────────────────────────
    console.log('Switching to Failed scenario...');
    await send('Runtime.evaluate', {
      expression: `
        if (window.__setTechnicalProofScenario) {
          window.__setTechnicalProofScenario('failed');
        }
        const overlay = document.querySelector('.tech-screen-overlay');
        if (overlay) overlay.scrollTop = 0;
        const hero = document.querySelector('.tech-hero-card');
        if (hero) hero.scrollIntoView({ block: 'start' });
      `
    });
    await delay(1000);

    console.log('Capturing Screenshot 5: Failed Proof with Retry Action...');
    const shot5 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(
      path.join(ARTIFACTS_DIR, 'screen27_05_failed_retry.png'),
      Buffer.from(shot5.result.data, 'base64')
    );

    // ─────────────────────────────────────────────────────────────
    // 6. STALE STATE (Verification Needs Review + Stale Proof)
    // ─────────────────────────────────────────────────────────────
    console.log('Switching to Stale scenario...');
    await send('Runtime.evaluate', {
      expression: `
        if (window.__setTechnicalProofScenario) {
          window.__setTechnicalProofScenario('stale');
        }
        const overlay = document.querySelector('.tech-screen-overlay');
        if (overlay) overlay.scrollTop = 0;
        const hero = document.querySelector('.tech-hero-card');
        if (hero) hero.scrollIntoView({ block: 'start' });
      `
    });
    await delay(1000);

    console.log('Capturing Screenshot 6: Stale Proof / Needs Review...');
    const shot6 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(
      path.join(ARTIFACTS_DIR, 'screen27_06_stale_needs_review.png'),
      Buffer.from(shot6.result.data, 'base64')
    );

    // ─────────────────────────────────────────────────────────────
    // 7. NOT CREATED STATE & CREATE PROOF MODAL (§ 14)
    // ─────────────────────────────────────────────────────────────
    console.log('Switching to Not Created scenario & Opening Modal...');
    await send('Runtime.evaluate', {
      expression: `
        if (window.__setTechnicalProofScenario) {
          window.__setTechnicalProofScenario('not_created');
        }
        const overlay = document.querySelector('.tech-screen-overlay');
        if (overlay) overlay.scrollTop = 0;
        const hero = document.querySelector('.tech-hero-card');
        if (hero) hero.scrollIntoView({ block: 'start' });
      `
    });
    await delay(600);

    await send('Runtime.evaluate', {
      expression: `
        const createBtn = document.querySelector('.tech-hero-btn');
        if (createBtn) createBtn.click();
      `
    });
    await delay(600);

    console.log('Capturing Screenshot 7: Create Technical Proof Confirmation Modal...');
    const shot7 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(
      path.join(ARTIFACTS_DIR, 'screen27_07_create_proof_modal.png'),
      Buffer.from(shot7.result.data, 'base64')
    );

    // ─────────────────────────────────────────────────────────────
    // 8. FULL HASH VIEWER MODAL
    // ─────────────────────────────────────────────────────────────
    console.log('Opening Full Hash Viewer Modal...');
    await send('Runtime.evaluate', {
      expression: `
        const cancelBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Cancel'));
        if (cancelBtn) cancelBtn.click();

        if (window.__setTechnicalProofScenario) {
          window.__setTechnicalProofScenario('confirmed');
        }
        const card = document.querySelector('.tech-proof-card');
        if (card) card.scrollIntoView({ block: 'start' });
      `
    });
    await delay(600);

    await send('Runtime.evaluate', {
      expression: `
        const viewBtns = Array.from(document.querySelectorAll('.tproof-mini-btn')).filter(b => b.textContent.trim() === 'View');
        if (viewBtns.length > 0) viewBtns[0].click();
      `
    });
    await delay(600);

    console.log('Capturing Screenshot 8: Full Hash Viewer Modal...');
    const shot8 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(
      path.join(ARTIFACTS_DIR, 'screen27_08_full_hash_modal.png'),
      Buffer.from(shot8.result.data, 'base64')
    );

    console.log('All 8 Screen 27 technical proof scenario screenshots captured successfully!');
    ws.close();
  } catch (e) {
    console.error('Test execution error:', e);
  } finally {
    edge.kill();
  }
}

run();
