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

  console.log('--- SCREEN 29 VERIFICATION SCANNER TESTS ---');

  // Reload page to ensure fresh code
  console.log('Reloading page and awaiting startup...');
  await send('Page.reload');
  await sleep(2600);

  // 1. Open Scanner via TopBar Scan button or window.__openProductScanner
  console.log('1. Opening Product Scanner...');
  const openRes = await send('Runtime.evaluate', {
    expression: `
      if (typeof window.__openProductScanner === 'function') {
        window.__openProductScanner();
        'called window.__openProductScanner';
      } else {
        const scanBtn = document.querySelector('.scan-product-pill');
        if (scanBtn) {
          scanBtn.click();
          'clicked scan-product-pill';
        } else {
          'not found';
        }
      }
    `,
    returnByValue: true
  });
  console.log('Open scanner action:', openRes?.result?.value);
  await sleep(700);

  // Capture Viewfinder Scanning state
  await saveShot('screen29_01_viewfinder_scanning');

  // 2. Open Demo Targets Drawer
  console.log('2. Opening Demo Targets Drawer...');
  await send('Runtime.evaluate', {
    expression: `
      const demoBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Demo') || b.title?.includes('Targets'));
      if (demoBtn) demoBtn.click();
    `
  });
  await sleep(400);
  await saveShot('screen29_02_demo_targets_drawer');

  // Close drawer
  await send('Runtime.evaluate', {
    expression: `
      const closeBtn = document.querySelector('.ps-demo-close-btn') || Array.from(document.querySelectorAll('button')).find(b => b.textContent === '✕');
      if (closeBtn) closeBtn.click();
    `
  });
  await sleep(300);

  // 3. Test Untrusted Domain QR Scan
  console.log('3. Simulating Untrusted Domain QR...');
  await send('Runtime.evaluate', {
    expression: `
      window.__simulateQrScan('https://untrusted-honey-scam.com/verify/FAKE-1234');
    `
  });
  await sleep(600);
  await saveShot('screen29_03_untrusted_domain_error');

  // 4. Test Malformed QR Scan
  console.log('4. Simulating Malformed QR...');
  await send('Runtime.evaluate', {
    expression: `
      window.__simulateQrScan('WIFI:S:MyNetwork;T:WPA;P:secret123;;');
    `
  });
  await sleep(600);
  await saveShot('screen29_04_malformed_qr_error');

  // 5. Test Manual Code Modal
  console.log('5. Opening Manual Code Modal...');
  await send('Runtime.evaluate', {
    expression: `
      const manualBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Enter verification code manually') || b.textContent.includes('Enter code manually'));
      if (manualBtn) manualBtn.click();
    `
  });
  await sleep(400);
  await saveShot('screen29_05_manual_entry_modal');

  // Close manual modal
  await send('Runtime.evaluate', {
    expression: `
      const closeBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent === '✕' || b.textContent === 'Cancel');
      if (closeBtn) closeBtn.click();
    `
  });
  await sleep(300);

  // 6. Simulate Valid QR Code Scan and verify navigation to Screen 28
  console.log('6. Simulating Valid Verified Jar QR Scan...');
  await send('Runtime.evaluate', {
    expression: `
      window.__simulateQrScan('https://verify.honeychain.org/verify/HC-PUB-7F82K9');
    `
  });
  await sleep(600);
  await saveShot('screen29_06_validating_detected');

  // Wait for transition to Screen 28
  await sleep(1400);
  await saveShot('screen29_07_navigated_to_screen28');

  // Check that public verification is open with HC-PUB-7F82K9
  const checkS28 = await send('Runtime.evaluate', {
    expression: `({
      hasPublicVerificationRoot: Boolean(document.querySelector('.public-verification-root')),
      badgeText: document.querySelector('.public-verification-root')?.innerText?.slice(0, 300)
    })`,
    returnByValue: true
  });
  console.log('Navigation to Screen 28 verified:', checkS28?.result?.value);

  ws.close();
}

run().catch(console.error);
