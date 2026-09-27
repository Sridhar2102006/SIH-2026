import fs from 'fs';

async function run() {
  const res = await fetch('http://localhost:9222/json');
  const targets = await res.json();
  const page = targets.find(t => t.url.includes('5173'));
  if (!page) {
    console.error('No page target found on 5173');
    process.exit(1);
  }
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);
  let id = 1;
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const curId = id++;
    const handler = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.id === curId) {
        ws.removeEventListener('message', handler);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: curId, method, params }));
  });

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const saveShot = async (name) => {
    const snap = await send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(snap.data, 'base64');
    fs.writeFileSync(`scripts/${name}.png`, buffer);
    console.log(`Saved scripts/${name}.png`);
  };

  console.log('--- EXHAUSTIVE SCREEN 29 TEST SUITE ---');

  // Reload page to start clean
  await send('Page.reload');
  await sleep(2700);

  // 1. Open Scanner
  console.log('1. Opening Scanner from TopBar...');
  await send('Runtime.evaluate', {
    expression: `
      window.__openProductScanner();
    `
  });
  await sleep(800);
  await saveShot('screen29_01_viewfinder_scanning');

  // 2. Open Demo Targets Drawer
  console.log('2. Opening Demo Targets Drawer...');
  await send('Runtime.evaluate', {
    expression: `
      const demoBtn = document.querySelector('.scanner-demo-pill');
      if (demoBtn) demoBtn.click();
    `
  });
  await sleep(400);
  await saveShot('screen29_02_demo_targets_drawer');

  // 3. Test Untrusted Domain Error
  console.log('3. Triggering Untrusted Domain scan...');
  await send('Runtime.evaluate', {
    expression: `
      window.__simulateQrScan('https://malicious-honey-scam.com/verify?id=666');
    `
  });
  await sleep(600);
  await saveShot('screen29_03_untrusted_domain_error');

  // 4. Test Malformed QR Error
  console.log('4. Triggering Malformed QR scan...');
  await send('Runtime.evaluate', {
    expression: `
      window.__simulateQrScan('NOT_A_HONEYCHAIN_QR_123456789');
    `
  });
  await sleep(600);
  await saveShot('screen29_04_malformed_qr_error');

  // 5. Open Manual Entry Modal
  console.log('5. Opening Manual Code Entry Modal...');
  await send('Runtime.evaluate', {
    expression: `
      const manualBtn = document.querySelector('.btn-enter-manual') || document.querySelector('.scanner-manual-btn');
      if (manualBtn) manualBtn.click();
    `
  });
  await sleep(400);
  await saveShot('screen29_05_manual_entry_modal');

  // Close Manual Entry Modal
  await send('Runtime.evaluate', {
    expression: `
      const cancelBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent === 'Cancel');
      if (cancelBtn) cancelBtn.click();
      const resumeBtn = document.querySelector('.btn-retry-scan');
      if (resumeBtn) resumeBtn.click();
    `
  });
  await sleep(400);

  // 6. Test Camera Permission Denied state
  console.log('6. Testing Camera Permission Denied state...');
  await send('Runtime.evaluate', {
    expression: `
      if (window.__setScannerDenied) {
        window.__setScannerDenied();
      }
    `
  });
  await sleep(300);
  await saveShot('screen29_06_permission_denied_state');

  // 7. Simulate Valid QR Scan (HC-PUB-7F82K9) and observe validation & Screen 28
  console.log('7. Simulating Valid Verified Jar QR Scan...');
  await send('Runtime.evaluate', {
    expression: `
      window.__simulateQrScan('https://verify.honeychain.org/verify/HC-PUB-7F82K9');
    `
  });
  await sleep(350);
  await saveShot('screen29_07_validating_detected');

  // Wait for transition to Screen 28
  await sleep(1500);
  await saveShot('screen29_08_navigated_to_screen28');

  const s28Result = await send('Runtime.evaluate', {
    expression: `({
      hasPublicVerificationRoot: Boolean(document.querySelector('.public-verification-root')),
      textSnippet: document.querySelector('.public-verification-root')?.innerText?.replace(/\\s+/g, ' ').slice(0, 200)
    })`,
    returnByValue: true
  });
  console.log('Screen 28 status:', s28Result?.result?.value);

  ws.close();
}

run().catch(console.error);
