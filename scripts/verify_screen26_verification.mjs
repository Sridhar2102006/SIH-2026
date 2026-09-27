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
  console.log('Launching headless Edge on port', PORT);
  const userDataDir = `C:/Users/sridh/AppData/Local/Temp/edge_sih_s26_${Date.now()}`;
  
  // Pre-seed localStorage in Edge via script or direct startup
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
    console.log('Connected to Edge via CDP WebSocket');

    await send('Page.enable');
    await send('Runtime.enable');
    await send('DOM.enable');

    await send('Emulation.setDeviceMetricsOverride', {
      width: 430,
      height: 932,
      deviceScaleFactor: 2,
      mobile: true
    });

    console.log('Setting localStorage and waiting for app ready...');
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
            capabilities: ['HIVE_MONITORING', 'BATCH_CREATE', 'COLLECTION_VIEW', 'QUALITY_TESTING', 'QUALITY_VIEW', 'QUALITY_RECORD', 'QUALITY_APPROVE', 'BATCH_VERIFY'],
            designations: ['BEEKEEPER', 'PROCESSOR', 'QUALITY', 'DISTRIBUTOR'],
            isAuthenticated: true,
            requiresVerification: false,
            isOnboardingComplete: true
          };
          localStorage.setItem('honeychain_user_session', JSON.stringify(session));
        })()
      `
    });

    // Navigate cleanly using Page.navigate to ensure session is loaded on fresh start
    console.log('Navigating to http://localhost:5173/ with preloaded session...');
    await send('Page.navigate', { url: 'http://localhost:5173/' });

    console.log('Waiting 5s for splash duration and main screen mount...');
    await delay(5000);

    // Check if main app is mounted
    const screenCheck = await send('Runtime.evaluate', {
      expression: `Boolean(document.querySelector('.bottom-nav') || document.querySelector('.top-bar'))`,
      returnByValue: true
    });
    console.log('Main App Mounted:', screenCheck.result?.result?.value);

    // Open Screen 26 — Verification for Batch HC-2409
    console.log('Opening Screen 26 — Verification for Batch HC-2409...');
    await send('Runtime.evaluate', {
      expression: `
        if (window.__openVerification) {
          window.__openVerification({
            batchId: 'batch-hc-2409',
            scenario: 'ready'
          });
        }
      `
    });

    await delay(1200);

    const isVerifOpen = await send('Runtime.evaluate', {
      expression: `Boolean(document.querySelector('.verif-screen-overlay'))`,
      returnByValue: true
    });
    console.log('Verification Screen Overlay Open:', isVerifOpen.result?.result?.value);

    // 1. Capture Screen 26 Overview: Ready for Verification
    console.log('Capturing Screenshot 1: Ready for Verification Overview...');
    const shot1 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(
      path.join(ARTIFACTS_DIR, 'screen26_01_ready_for_verification.png'),
      Buffer.from(shot1.result.data, 'base64')
    );

    // 2. Click "Verify batch" button to open Confirmation Sheet
    console.log('Opening Confirmation Modal...');
    await send('Runtime.evaluate', {
      expression: `
        const btn = document.querySelector('.verif-fbtn-verify');
        if (btn) btn.click();
      `
    });

    await delay(800);

    console.log('Capturing Screenshot 2: Confirmation Sheet with Claim Limits...');
    const shot2 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(
      path.join(ARTIFACTS_DIR, 'screen26_02_confirmation_modal.png'),
      Buffer.from(shot2.result.data, 'base64')
    );

    // 3. Confirm Verification
    console.log('Confirming verification...');
    const confirmResult = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const confirmBtn = Array.from(document.querySelectorAll('.verif-cbtn')).find(b => b.textContent.includes('Confirm'));
          if (confirmBtn) {
            confirmBtn.click();
            return 'clicked confirm';
          }
          return 'button not found';
        })()
      `,
      returnByValue: true
    });
    console.log('Confirm Click Result:', confirmResult.result?.result?.value);

    // Wait for sealing animation to complete
    await delay(2200);

    console.log('Capturing Screenshot 3: Calm Verified Hero State...');
    const shot3 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(
      path.join(ARTIFACTS_DIR, 'screen26_03_verified_hero_state.png'),
      Buffer.from(shot3.result.data, 'base64')
    );

    // 4. Open Authenticity Certificate
    console.log('Opening Authenticity Certificate...');
    const certResult = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const certBtn = Array.from(document.querySelectorAll('.verif-sub-btn')).find(b => b.textContent.includes('certificate'));
          if (certBtn) {
            certBtn.click();
            return 'clicked certificate';
          }
          return 'cert button not found';
        })()
      `,
      returnByValue: true
    });
    console.log('Cert Click Result:', certResult.result?.result?.value);

    await delay(800);

    console.log('Capturing Screenshot 4: Authenticity Certificate Modal...');
    const shot4 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(
      path.join(ARTIFACTS_DIR, 'screen26_04_authenticity_certificate.png'),
      Buffer.from(shot4.result.data, 'base64')
    );

    // Close certificate
    await send('Runtime.evaluate', {
      expression: `
        const closeBtn = document.querySelector('.verif-modal-close-btn');
        if (closeBtn) closeBtn.click();
      `
    });
    await delay(500);

    // 5. Open Consumer Verification Experience (Product QR)
    console.log('Opening Consumer Product QR Modal...');
    await send('Runtime.evaluate', {
      expression: `
        const qrBtn = Array.from(document.querySelectorAll('.verif-sub-btn')).find(b => b.textContent.includes('QR'));
        if (qrBtn) qrBtn.click();
      `
    });

    await delay(800);

    console.log('Capturing Screenshot 5: Consumer Verification Experience Modal...');
    const shot5 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(
      path.join(ARTIFACTS_DIR, 'screen26_05_consumer_qr_experience.png'),
      Buffer.from(shot5.result.data, 'base64')
    );

    // Close QR modal cleanly
    await send('Runtime.evaluate', {
      expression: `
        const overlay = document.querySelector('.verif-modal-overlay');
        if (overlay) overlay.click();
      `
    });
    await delay(600);

    // 6. Expand Technical Proof & Scroll to Audit History
    console.log('Expanding Cryptographic Technical Proof...');
    await send('Runtime.evaluate', {
      expression: `
        const techBtn = document.querySelector('.verif-tech-toggle-btn');
        if (techBtn) techBtn.click();
        const container = document.querySelector('.verif-screen-overlay');
        if (container) container.scrollTop = 550;
      `
    });

    await delay(800);

    console.log('Capturing Screenshot 6: Technical Proof & Verification History...');
    const shot6 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(
      path.join(ARTIFACTS_DIR, 'screen26_06_technical_proof_and_audit.png'),
      Buffer.from(shot6.result.data, 'base64')
    );

    // 7. Open Jury Demonstration Drawer
    console.log('Opening Jury Demo Drawer...');
    await send('Runtime.evaluate', {
      expression: `
        const demoBtn = document.querySelector('.verif-demo-pill');
        if (demoBtn) demoBtn.click();
      `
    });

    await delay(800);

    console.log('Capturing Screenshot 7: Jury Demo Drawer...');
    const shot7 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(
      path.join(ARTIFACTS_DIR, 'screen26_07_jury_demo_drawer.png'),
      Buffer.from(shot7.result.data, 'base64')
    );

    // 8. Switch to "Incomplete (Packaging Missing)" Scenario
    console.log('Switching to Packaging Incomplete Scenario...');
    await send('Runtime.evaluate', {
      expression: `
        const presets = document.querySelectorAll('.verif-preset-card');
        if (presets[1]) presets[1].click();
        const drawerOverlay = document.querySelector('.verif-drawer-overlay');
        if (drawerOverlay) drawerOverlay.click();
        const container = document.querySelector('.verif-screen-overlay');
        if (container) container.scrollTop = 0;
      `
    });

    await delay(800);

    console.log('Capturing Screenshot 8: Incomplete Requirement (Packaging Missing)...');
    const shot8 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(
      path.join(ARTIFACTS_DIR, 'screen26_08_not_ready_packaging_missing.png'),
      Buffer.from(shot8.result.data, 'base64')
    );

    console.log('All 8 Screen 26 verification screenshots successfully saved!');
    ws.close();
  } catch (err) {
    console.error('Error during verification:', err);
  } finally {
    edge.kill();
  }
}

run();
