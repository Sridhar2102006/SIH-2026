import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/sridh/.gemini/antigravity-ide/brain/376452b6-17d5-4aab-a736-3c8277087e84';
const EDGE_PATH = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const PORT = 9392;

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  const userDataDir = `C:/Users/sridh/AppData/Local/Temp/edge_sih_s26_p2_${Date.now()}`;
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

    await send('Page.navigate', { url: 'http://localhost:5173/' });
    await delay(5000);

    // Open Screen 26 with scenario 'not_ready' (Packaging missing)
    console.log('Opening Screen 26 in Not Ready scenario...');
    await send('Runtime.evaluate', {
      expression: `
        if (window.__openVerification) {
          window.__openVerification({
            batchId: 'batch-hc-2409',
            scenario: 'not_ready'
          });
        }
      `
    });

    await delay(1200);

    console.log('Capturing Screenshot 8: Incomplete Requirement (Packaging Missing)...');
    const shot8 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(
      path.join(ARTIFACTS_DIR, 'screen26_08_not_ready_packaging_missing.png'),
      Buffer.from(shot8.result.data, 'base64')
    );

    // Open Screen 26 with scenario 'needs_attention' (Moisture flagged)
    console.log('Switching to Needs Attention scenario...');
    await send('Runtime.evaluate', {
      expression: `
        if (window.__openVerification) {
          window.__openVerification({
            batchId: 'batch-hc-2409',
            scenario: 'needs_attention'
          });
        }
      `
    });

    await delay(1200);

    console.log('Capturing Screenshot 9: Needs Attention (Moisture Flagged)...');
    const shot9 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(
      path.join(ARTIFACTS_DIR, 'screen26_09_needs_attention_quality.png'),
      Buffer.from(shot9.result.data, 'base64')
    );

    console.log('Screenshots 8 and 9 captured cleanly!');
    ws.close();
  } catch (e) {
    console.error(e);
  } finally {
    edge.kill();
  }
}

run();
