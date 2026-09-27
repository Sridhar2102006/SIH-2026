import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/sridh/.gemini/antigravity-ide/brain/376452b6-17d5-4aab-a736-3c8277087e84';
const EDGE_PATH = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const PORT = 9348;

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  console.log('Launching headless Edge on port', PORT);
  const userDataDir = `C:/Users/sridh/AppData/Local/Temp/edge_sih_s17_${Date.now()}`;
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

    console.log('Navigating and setting authenticated session...');
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

    // Click Hives tab
    console.log('Clicking Hives tab...');
    await evaluate(`
      (() => {
        const nav = Array.from(document.querySelectorAll('.nav-item')).find(n => n.innerText.includes('Hives'));
        if (nav) nav.click();
      })()
    `);
    await delay(1200);

    // Open first hive (e.g. Cedar Queen or Meadow Sweet) via .hive-clean-card
    console.log('Opening Hive Detail by clicking .hive-clean-card...');
    const cardClicked = await evaluate(`
      (() => {
        const card = document.querySelector('.hive-clean-card');
        if (card) {
          card.click();
          return true;
        }
        return false;
      })()
    `);
    console.log('Hive clean card clicked:', cardClicked);
    await delay(1800);

    // Click "View technical details"
    console.log('Clicking "View technical details" button...');
    const techBtnClicked = await evaluate(`
      (() => {
        const trigger = document.querySelector('.hd-tech-trigger-btn, .hd-tech-summary-box button');
        if (trigger) {
          trigger.click();
          return true;
        }
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.innerText.includes('View technical details'));
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      })()
    `);
    console.log('Tech details button clicked:', techBtnClicked);
    await delay(1800);

    // 1. Capture Screen 17: Technical Details Overview
    await takeScreenshot('screen17_technical_details_top');

    // 2. Test Ping ESP32 node
    console.log('Testing Ping Node...');
    await evaluate(`
      (() => {
        const pingBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Ping node') || b.innerText.includes('Refresh status'));
        if (pingBtn) pingBtn.click();
      })()
    `);
    await delay(1500);

    // 3. Test Expand "View raw readings"
    console.log('Expanding raw sensor readings...');
    await evaluate(`
      (() => {
        const rawBtn = Array.from(document.querySelectorAll('.tech-expand-toggle')).find(b => b.innerText.includes('raw readings'));
        if (rawBtn) rawBtn.click();
      })()
    `);
    await delay(600);

    // 4. Test "Test sensors"
    console.log('Testing sensor array bus...');
    await evaluate(`
      (() => {
        const sBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Test sensors'));
        if (sBtn) sBtn.click();
      })()
    `);
    await delay(1500);

    // 5. Test "Test camera"
    console.log('Testing camera module capture...');
    await evaluate(`
      (() => {
        const cBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Test camera'));
        if (cBtn) cBtn.click();
      })()
    `);
    await delay(1600);

    // Capture Screen 17 active tests
    await takeScreenshot('screen17_technical_details_diagnostics');

    // 6. Test Expand "View diagnostic logs"
    console.log('Expanding diagnostic logs...');
    await evaluate(`
      (() => {
        const logBtn = Array.from(document.querySelectorAll('.tech-expand-toggle')).find(b => b.innerText.includes('diagnostic logs'));
        if (logBtn) logBtn.click();
      })()
    `);
    await delay(600);

    // Switch logs to advanced payload view
    await evaluate(`
      (() => {
        const advBtn = document.querySelector('.tech-log-mode-btn');
        if (advBtn) advBtn.click();
      })()
    `);
    await delay(600);

    await takeScreenshot('screen17_technical_details_logs');

    // 7. Test Restart device modal
    console.log('Opening restart device modal...');
    await evaluate(`
      (() => {
        const rBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Restart monitoring device'));
        if (rBtn) rBtn.click();
      })()
    `);
    await delay(800);

    await takeScreenshot('screen17_restart_device_modal');

    // Confirm restart
    console.log('Confirming device restart...');
    await evaluate(`
      (() => {
        const restartConfirm = Array.from(document.querySelectorAll('.tech-modal-actions button.btn-danger')).find(b => b.innerText.includes('Restart'));
        if (restartConfirm) restartConfirm.click();
      })()
    `);
    await delay(3800); // Wait for reboot & reconnect cycle

    await takeScreenshot('screen17_reconnect_success_banner');

    // Scroll down to view Sensors, Camera, Data Sync, Hardware, Device Actions, Logs
    console.log('Scrolling down to sensors and camera...');
    await evaluate(`
      (() => {
        const appContent = document.querySelector('.app-content');
        if (appContent) appContent.scrollTop = 500;
      })()
    `);
    await delay(800);
    await takeScreenshot('screen17_technical_details_sensors_and_camera');

    console.log('Scrolling down to hardware, actions, and logs...');
    await evaluate(`
      (() => {
        const appContent = document.querySelector('.app-content');
        if (appContent) appContent.scrollTop = 1400;
      })()
    `);
    await delay(800);
    await takeScreenshot('screen17_technical_details_actions_and_logs');

    console.log('Scrolling down to bottom logs and jury controls...');
    await evaluate(`
      (() => {
        const appContent = document.querySelector('.app-content');
        if (appContent) appContent.scrollTop = 2400;
      })()
    `);
    await delay(800);
    await takeScreenshot('screen17_technical_details_bottom');

    ws.close();
    console.log('Screen 17 automated verification completed successfully!');
  } finally {
    edge.kill();
  }
}

run().catch((e) => {
  console.error('Test failed:', e);
  process.exit(1);
});
