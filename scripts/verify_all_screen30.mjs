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

  console.log('--- SCREEN 30 PRODUCT / PACKAGE QR MANAGEMENT TESTS ---');

  // Reload page to start clean with compiled modules
  console.log('Reloading page and awaiting startup...');
  await send('Page.reload');
  await sleep(2800);

  // 1. Open Screen 30 for Batch HC-2409
  console.log('1. Opening Product QR Management for Batch HC-2409...');
  await send('Runtime.evaluate', {
    expression: `
      window.__openProductQrManagement({ batchId: 'batch-hc-2409' });
    `
  });
  await sleep(800);
  await saveShot('screen30_01_active_qr_view');

  // 2. Open Jury Demo Scenarios Drawer
  console.log('2. Opening Jury Demo Drawer...');
  await send('Runtime.evaluate', {
    expression: `
      const demoBtn = document.querySelector('.pqr-demo-pill');
      if (demoBtn) demoBtn.click();
    `
  });
  await sleep(400);
  await saveShot('screen30_02_jury_demo_drawer');

  // Close demo drawer
  await send('Runtime.evaluate', {
    expression: `
      const closeBtn = document.querySelector('.pqr-drawer-close');
      if (closeBtn) closeBtn.click();
    `
  });
  await sleep(300);

  // 3. Open Print / Download Label Sticker Modal
  console.log('3. Opening Printable Label Sticker Modal...');
  await send('Runtime.evaluate', {
    expression: `
      const printBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Print label'));
      if (printBtn) printBtn.click();
    `
  });
  await sleep(400);
  await saveShot('screen30_06_printable_label_sticker');

  // Close print modal
  await send('Runtime.evaluate', {
    expression: `
      const closeBtn = document.querySelector('.print-card .pqr-modal-close');
      if (closeBtn) closeBtn.click();
    `
  });
  await sleep(300);

  // 4. Open Revoke QR Modal
  console.log('4. Opening Revoke QR Modal...');
  await send('Runtime.evaluate', {
    expression: `
      const revokeBtn = document.querySelector('.pqr-sub-btn.revoke');
      if (revokeBtn) revokeBtn.click();
    `
  });
  await sleep(400);
  await saveShot('screen30_07_revoke_qr_modal');

  // Close revoke modal
  await send('Runtime.evaluate', {
    expression: `
      const cancelBtn = Array.from(document.querySelectorAll('.pqr-modal-card button')).find(b => b.textContent === 'Cancel');
      if (cancelBtn) cancelBtn.click();
    `
  });
  await sleep(300);

  // 5. Open Replace QR Modal
  console.log('5. Opening Replace QR Modal...');
  await send('Runtime.evaluate', {
    expression: `
      const replaceBtn = Array.from(document.querySelectorAll('.pqr-sub-btn')).find(b => b.textContent.includes('replacement'));
      if (replaceBtn) replaceBtn.click();
    `
  });
  await sleep(400);
  await saveShot('screen30_08_replace_qr_modal');

  // Close replace modal
  await send('Runtime.evaluate', {
    expression: `
      const cancelBtn = Array.from(document.querySelectorAll('.pqr-modal-card button')).find(b => b.textContent === 'Cancel');
      if (cancelBtn) cancelBtn.click();
    `
  });
  await sleep(300);

  // 6. Switch to Package-Level Serialization Tab
  console.log('6. Switching to Package-Level Serialization Tab...');
  await send('Runtime.evaluate', {
    expression: `
      const pkgTab = Array.from(document.querySelectorAll('.pqr-tab-btn')).find(b => b.textContent.includes('Package Serialized'));
      if (pkgTab) pkgTab.click();
    `
  });
  await sleep(600);
  await saveShot('screen30_05_package_serialization_view');

  // Switch back to Batch tab
  await send('Runtime.evaluate', {
    expression: `
      const batchTab = Array.from(document.querySelectorAll('.pqr-tab-btn')).find(b => b.textContent.includes('Batch QR'));
      if (batchTab) batchTab.click();
    `
  });
  await sleep(400);

  // 7. Expand Technical Specifications Accordion
  console.log('7. Expanding Technical Specifications Accordion...');
  await send('Runtime.evaluate', {
    expression: `
      const techToggle = document.querySelector('.pqr-tech-toggle');
      if (techToggle) techToggle.click();
    `
  });
  await sleep(400);
  await saveShot('screen30_09_technical_specifications');

  // 8. Open Public Verification (Screen 28) from Screen 30
  console.log('8. Opening Public Verification from Screen 30...');
  await send('Runtime.evaluate', {
    expression: `
      const openPublicBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Open public verification'));
      if (openPublicBtn) openPublicBtn.click();
    `
  });
  await sleep(900);
  await saveShot('screen30_10_navigation_to_screen28');

  const s28Check = await send('Runtime.evaluate', {
    expression: `({
      hasPublicVerificationRoot: Boolean(document.querySelector('.public-verification-root')),
      textSnippet: document.querySelector('.public-verification-root')?.innerText?.replace(/\\s+/g, ' ').slice(0, 150)
    })`,
    returnByValue: true
  });
  console.log('Screen 28 navigation check:', s28Check?.result?.value);

  ws.close();
}

run().catch(console.error);
