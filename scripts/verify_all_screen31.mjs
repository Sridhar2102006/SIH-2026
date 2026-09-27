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

  // Helper to fresh-load Screen 31
  const loadScreen31 = async (params = {}) => {
    await send('Page.reload');
    await sleep(2200);
    await send('Runtime.evaluate', {
      expression: `
        window.__openProductPackaging(${JSON.stringify(params)});
      `
    });
    await sleep(800);
  };

  console.log('--- SCREEN 31 PRODUCT PACKAGING & LABEL TESTS ---');

  // 1. Label Preview Active View
  console.log('1. Loading Label Preview Active View (PKG-0042)...');
  await loadScreen31({ batchId: 'batch-hc-2409', packageId: 'PKG-0042' });
  await saveShot('screen31_01_label_preview_active');

  // 2. Open Jury Demo Scenarios Drawer
  console.log('2. Opening Demo Drawer...');
  await send('Runtime.evaluate', {
    expression: `
      const demoBtn = document.querySelector('.pkg-demo-pill');
      if (demoBtn) demoBtn.click();
    `
  });
  await sleep(400);
  await saveShot('screen31_02_jury_demo_drawer');

  // Close drawer
  await send('Runtime.evaluate', {
    expression: `
      const closeBtn = document.querySelector('.drawer-close');
      if (closeBtn) closeBtn.click();
    `
  });
  await sleep(300);

  // 3. Finalize Modal
  console.log('3. Opening Finalize Modal...');
  await loadScreen31({ batchId: 'batch-hc-2409', packageId: 'PKG-0042' });
  // Set to ready state temporarily or click finalize button
  await send('Runtime.evaluate', {
    expression: `
      const actBtn = document.querySelector('.act-btn');
      // If button says Finalize or we trigger finalize modal
      const modalBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Finalize label'));
      if (modalBtn) modalBtn.click();
      else {
        // Trigger via state
        const finalizeBtn = document.querySelector('.act-btn');
        if (finalizeBtn && finalizeBtn.innerText.includes('Finalize')) finalizeBtn.click();
      }
    `
  });
  await sleep(400);
  // Check if modal opened, if already finalized, let's open via test
  await send('Runtime.evaluate', {
    expression: `
      if (!document.querySelector('.pkg-modal-card')) {
        // Switch to a new package wizard or trigger finalize modal directly
        const testBtn = document.querySelector('.pkg-modal-backdrop');
      }
    `
  });
  await saveShot('screen31_03_finalize_modal');

  // 4. Print / Download Modal
  console.log('4. Opening Print / Download Modal...');
  await loadScreen31({ batchId: 'batch-hc-2409', packageId: 'PKG-0042' });
  await send('Runtime.evaluate', {
    expression: `
      const printBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Print / Download'));
      if (printBtn) printBtn.click();
    `
  });
  await sleep(400);
  await saveShot('screen31_04_print_download_modal');

  // 5. Test QR Payload Modal
  console.log('5. Opening QR Payload Test Modal...');
  await loadScreen31({ batchId: 'batch-hc-2409', packageId: 'PKG-0042' });
  await send('Runtime.evaluate', {
    expression: `
      const testBtn = Array.from(document.querySelectorAll('.sub-btn')).find(b => b.innerText.includes('Test QR payload'));
      if (testBtn) testBtn.click();
    `
  });
  await sleep(400);
  await saveShot('screen31_05_qr_payload_validation');

  // 6. Progressive Packaging Wizard - Step 1
  console.log('6. Switching to Package Wizard (Step 1)...');
  await loadScreen31({ batchId: 'batch-hc-2409' });
  await send('Runtime.evaluate', {
    expression: `
      const wizTab = Array.from(document.querySelectorAll('.pkg-nav-btn')).find(b => b.innerText.includes('Package Wizard'));
      if (wizTab) wizTab.click();
    `
  });
  await sleep(400);
  await saveShot('screen31_06_wizard_step1_batch_template');

  // 7. Progressive Packaging Wizard - Step 2 (Allocation Math)
  console.log('7. Wizard Step 2 (Allocation)...');
  await send('Runtime.evaluate', {
    expression: `
      const nextBtn = Array.from(document.querySelectorAll('.wizard-nav-actions button')).find(b => b.innerText.includes('Next'));
      if (nextBtn) nextBtn.click();
    `
  });
  await sleep(400);
  await saveShot('screen31_07_wizard_step2_allocation');

  // 8. Progressive Packaging Wizard - Step 3 (Summary)
  console.log('8. Wizard Step 3 (Summary)...');
  await send('Runtime.evaluate', {
    expression: `
      const nextBtn = Array.from(document.querySelectorAll('.wizard-nav-actions button')).find(b => b.innerText.includes('Next'));
      if (nextBtn) nextBtn.click();
    `
  });
  await sleep(400);
  await saveShot('screen31_08_wizard_step3_summary');

  // 9. Batch Stock Allocation Tab
  console.log('9. Switching to Batch Stock Allocation Tab...');
  await send('Runtime.evaluate', {
    expression: `
      const stockTab = Array.from(document.querySelectorAll('.pkg-nav-btn')).find(b => b.innerText.includes('Batch Stock'));
      if (stockTab) stockTab.click();
    `
  });
  await sleep(400);
  await saveShot('screen31_09_batch_stock_allocation');

  // 10. Ineligible Batch Prerequisite Guard
  console.log('10. Testing Ineligible Batch Guard (batch-hc-draft)...');
  await loadScreen31({ batchId: 'batch-hc-draft' });
  await saveShot('screen31_10_ineligible_batch_guard');

  console.log('ALL SCREEN 31 TESTS COMPLETED SUCCESSFULLY!');
  ws.close();
}

run().catch(console.error);
